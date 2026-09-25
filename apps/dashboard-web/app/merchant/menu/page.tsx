'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { LoaderCircle, Pencil, Plus, Search, Trash2, Utensils, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCategoriesQuery,
  useDeleteMerchantMenuItemMutation,
  useMerchantMenuQuery,
  useMerchantRestaurantsQuery,
} from '@plate40/state';
import type { MenuItem } from '@plate40/types';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  FoodTypeIndicator,
  PageHeader,
  Price,
  Skeleton,
} from '@plate40/ui';
import { DataTable } from '../../../components/data-table';
import { AddMenuItemDialog } from './add-menu-item-dialog';
import { ItemAvailability } from './item-availability';

export default function MerchantMenuPage() {
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const menuQuery = useMerchantMenuQuery();
  const categoryQuery = useCategoriesQuery();
  const restaurantQuery = useMerchantRestaurantsQuery();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteMerchantMenuItemMutation();
  const categories = useMemo(() => categoryQuery.data ?? [], [categoryQuery.data]);
  const restaurants = useMemo(() => restaurantQuery.data ?? [], [restaurantQuery.data]);
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const data = useMemo(
    () =>
      (menuQuery.data ?? []).filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
        const matchesCategory = categoryId === 'all' || item.categoryId === Number(categoryId);
        return matchesSearch && matchesCategory;
      }),
    [categoryId, menuQuery.data, search],
  );
  const columns = useMemo<Array<ColumnDef<MenuItem>>>(
    () => [
      {
        accessorKey: 'name',
        header: 'Item',
        cell: ({ row }) => (
          <div className="menu-item-cell">
            <span
              className="menu-item-cell__image"
              style={
                row.original.imageUrl
                  ? { backgroundImage: `url(${row.original.imageUrl})` }
                  : undefined
              }
            >
              {row.original.imageUrl ? null : <Utensils size={18} />}
            </span>
            <div>
              <strong>{row.original.name}</strong>
              <small>{row.original.description || 'No description added'}</small>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'categoryId',
        header: 'Category',
        cell: ({ row }) => (
          <Badge>{categoryNames.get(row.original.categoryId) ?? 'Uncategorised'}</Badge>
        ),
      },
      {
        accessorKey: 'foodType',
        header: 'Food type',
        cell: ({ row }) => (
          <span className="menu-food-cell">
            <FoodTypeIndicator vegetarian={row.original.foodType === 'VEG'} />
            {row.original.foodType === 'NON_VEG'
              ? 'Non-veg'
              : row.original.foodType === 'EGG'
                ? 'Egg'
                : 'Veg'}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div className="menu-price-cell">
            <Price value={row.original.discountedPrice || row.original.price} />
            {row.original.discountedPrice ? (
              <del>
                <Price value={row.original.price} />
              </del>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'preparationTimeMinutes',
        header: 'Prep time',
        cell: ({ row }) => `${row.original.preparationTimeMinutes} min`,
      },
      {
        accessorKey: 'isAvailable',
        header: 'Availability',
        cell: ({ row }) => <ItemAvailability key={`${row.original.id}-${row.original.soldOutUntil}-${JSON.stringify(row.original.serviceHours)}`} item={row.original} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="menu-row-actions">
            <button
              type="button"
              className="menu-action-button"
              aria-label={`Edit ${row.original.name}`}
              title="Edit item"
              onClick={() => setEditingItem(row.original)}
            >
              <Pencil size={17} />
            </button>
            <button
              type="button"
              className="menu-action-button menu-action-button--danger"
              aria-label={`Delete ${row.original.name}`}
              title="Delete item"
              onClick={() => setDeletingItem(row.original)}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ),
      },
    ],
    [categoryNames],
  );
  const isLoading = menuQuery.isLoading || categoryQuery.isLoading || restaurantQuery.isLoading;
  const isError = menuQuery.isError || categoryQuery.isError || restaurantQuery.isError;
  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteItem(deletingItem.id).unwrap();
      toast.success(`${deletingItem.name} deleted from your menu`);
      setDeletingItem(null);
    } catch {
      toast.error('Could not delete this item. Please try again.');
    }
  };

  return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto pb-16">
      <PageHeader
        title="Menu & stock"
        description="Build your catalogue and control what customers can order in real time."
        actions={
          <Button onClick={() => setShowAddItem(true)}>
            <Plus size={18} />
            Add new item
          </Button>
        }
      />
      <div className="menu-summary">
        <div>
          <strong>{menuQuery.data?.length ?? 0}</strong>
          <span>Total items</span>
        </div>
        <div>
          <strong>{menuQuery.data?.filter((item) => item.isAvailable).length ?? 0}</strong>
          <span>Available now</span>
        </div>
        <div>
          <strong>{menuQuery.data?.filter((item) => item.discountedPrice).length ?? 0}</strong>
          <span>On offer</span>
        </div>
      </div>
      <Card className="table-card menu-catalogue-card">
        <div className="menu-toolbar">
          <label>
            <Search size={18} />
            <input
              type="search"
              placeholder="Search menu items"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <ErrorState message="We could not load your menu catalogue." />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            emptyMessage={
              search || categoryId !== 'all'
                ? 'No items match these filters.'
                : 'Your menu is empty. Add your first item to get started.'
            }
          />
        )}
      </Card>
      {showAddItem || editingItem ? (
        <AddMenuItemDialog
          open
          item={editingItem}
          onClose={() => {
            setShowAddItem(false);
            setEditingItem(null);
          }}
          categories={categories}
          restaurants={restaurants}
        />
      ) : null}
      {deletingItem ? (
        <div
          className="menu-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) setDeletingItem(null);
          }}
        >
          <section
            className="delete-item-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-item-title"
          >
            <button
              type="button"
              className="menu-dialog__close"
              aria-label="Close"
              onClick={() => setDeletingItem(null)}
              disabled={isDeleting}
            >
              <X size={20} />
            </button>
            <span className="delete-item-dialog__icon">
              <Trash2 size={24} />
            </span>
            <h2 id="delete-item-title">Delete {deletingItem.name}?</h2>
            <p>
              This item will be removed from your catalogue and will no longer appear to customers.
            </p>
            <footer>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <LoaderCircle className="menu-spinner" size={17} />
                ) : (
                  <Trash2 size={17} />
                )}
                {isDeleting ? 'Deleting...' : 'Delete item'}
              </Button>
            </footer>
          </section>
        </div>
      ) : null}
    </main>
  );
}
