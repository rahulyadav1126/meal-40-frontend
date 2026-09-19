'use client';

import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { ImagePlus, LoaderCircle, Store, Tags, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateMerchantMenuItemMutation,
  useUpdateMerchantMenuItemMutation,
  useUploadMenuImageMutation,
} from '@plate40/state';
import { FoodType, type Category, type MenuItem, type Restaurant } from '@plate40/types';
import { Button, Input } from '@plate40/ui';

interface Props {
  categories: Category[];
  restaurants: Restaurant[];
  item?: MenuItem | null;
  open: boolean;
  onClose: () => void;
}
const INITIAL_FORM = {
  name: '',
  categoryId: '',
  restaurantId: '',
  description: '',
  price: '',
  discountedPrice: '',
  foodType: FoodType.VEG,
  preparationTimeMinutes: '20',
  isAvailable: true,
};

function messageFrom(error: unknown): string {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return 'Unable to save this item. Please try again.';
}

export function AddMenuItemDialog({ categories, restaurants, item, open, onClose }: Props) {
  const titleId = useId();
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    name: item?.name ?? '',
    categoryId: item?.categoryId.toString() ?? categories[0]?.id.toString() ?? '',
    restaurantId: item?.restaurantId.toString() ?? restaurants[0]?.id.toString() ?? '',
    description: item?.description ?? '',
    price: item?.price ?? '',
    discountedPrice: item?.discountedPrice ?? '',
    foodType: item?.foodType ?? FoodType.VEG,
    preparationTimeMinutes: item?.preparationTimeMinutes.toString() ?? '20',
    isAvailable: item?.isAvailable ?? true,
  }));
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(item?.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [uploadImage, uploadState] = useUploadMenuImageMutation();
  const [createItem, createState] = useCreateMerchantMenuItemMutation();
  const [updateItem, updateState] = useUpdateMerchantMenuItemMutation();
  const isSaving = uploadState.isLoading || createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isSaving, onClose, open]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  if (!open) return null;
  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };
  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5_000_000) {
      setError('The image must be smaller than 5 MB.');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const price = Number(form.price);
    const discount = form.discountedPrice ? Number(form.discountedPrice) : null;
    if (!form.restaurantId || !form.categoryId) {
      setError('A restaurant and category are required.');
      return;
    }
    if (form.name.trim().length < 2) {
      setError('Item name must contain at least 2 characters.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a valid price greater than zero.');
      return;
    }
    if (discount !== null && (!Number.isFinite(discount) || discount <= 0 || discount >= price)) {
      setError('Discount price must be greater than zero and lower than the regular price.');
      return;
    }
    try {
      const uploaded = image ? await uploadImage(image).unwrap() : null;
      const payload = {
        restaurantId: Number(form.restaurantId),
        categoryId: Number(form.categoryId),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        imageUrl: uploaded?.url,
        foodType: form.foodType,
        price: price.toFixed(2),
        discountedPrice: discount?.toFixed(2) ?? null,
        preparationTimeMinutes: Number(form.preparationTimeMinutes),
        isAvailable: form.isAvailable,
      };
      if (item) {
        await updateItem({ itemId: item.id, data: payload }).unwrap();
      } else {
        await createItem(payload).unwrap();
      }
      toast.success(
        item
          ? `${form.name.trim()} updated successfully`
          : `${form.name.trim()} added to your menu`,
      );
      onClose();
    } catch (caught) {
      setError(messageFrom(caught));
    }
  };

  return (
    <div
      className="menu-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section className="menu-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="menu-dialog__header">
          <div>
            <span className="menu-dialog__eyebrow">MENU CATALOGUE</span>
            <h2 id={titleId}>{item ? 'Edit item' : 'Add new item'}</h2>
            <p>
              {item
                ? 'Update this item and keep your customer menu accurate.'
                : 'Create a polished listing customers can order right away.'}
            </p>
          </div>
          <button
            type="button"
            className="menu-dialog__close"
            aria-label="Close"
            onClick={onClose}
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </header>
        {!restaurants.length || !categories.length ? (
          <div className="menu-prerequisite">
            <span className="menu-prerequisite__icon">
              {!restaurants.length ? <Store size={28} /> : <Tags size={28} />}
            </span>
            <h3>
              {!restaurants.length
                ? 'Set up your restaurant first'
                : 'Menu categories are being prepared'}
            </h3>
            <p>
              {!restaurants.length
                ? 'A menu item must belong to a restaurant. Complete your store profile, then return here to add dishes.'
                : 'No active menu categories are available yet. Refresh the page after the category setup completes.'}
            </p>
            {!restaurants.length ? (
              <Link
                className="p40-button p40-button--primary"
                href="/merchant/settings"
                onClick={onClose}
              >
                Set up restaurant
              </Link>
            ) : (
              <Button type="button" onClick={() => window.location.reload()}>
                Refresh categories
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="menu-item-form">
            <div className="menu-item-form__fields">
              {restaurants.length > 1 ? (
                <label className="p40-field">
                  <span className="p40-label">Restaurant</span>
                  <select
                    className="p40-input"
                    value={form.restaurantId}
                    onChange={(event) => update('restaurantId', event.target.value)}
                    required
                  >
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="p40-field">
                <span className="p40-label">Item name</span>
                <Input
                  autoFocus
                  maxLength={160}
                  placeholder="Paneer Butter Masala"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  required
                />
              </label>
              <label className="p40-field">
                <span className="p40-label">Category</span>
                <select
                  className="p40-input"
                  value={form.categoryId}
                  onChange={(event) => update('categoryId', event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="p40-field menu-item-form__wide">
                <span className="p40-label">
                  Description <small>Optional</small>
                </span>
                <textarea
                  className="p40-input menu-item-form__textarea"
                  maxLength={2000}
                  placeholder="Rich and creamy paneer curry prepared with aromatic spices..."
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                />
              </label>
              <label className="p40-field">
                <span className="p40-label">Price</span>
                <span className="money-input">
                  <span>₹</span>
                  <Input
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    placeholder="249"
                    value={form.price}
                    onChange={(event) => update('price', event.target.value)}
                    required
                  />
                </span>
              </label>
              <label className="p40-field">
                <span className="p40-label">
                  Discount price <small>Optional</small>
                </span>
                <span className="money-input">
                  <span>₹</span>
                  <Input
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    placeholder="199"
                    value={form.discountedPrice}
                    onChange={(event) => update('discountedPrice', event.target.value)}
                  />
                </span>
              </label>
              <fieldset className="p40-field menu-food-type">
                <legend className="p40-label">Food type</legend>
                <div>
                  {[FoodType.VEG, FoodType.NON_VEG, FoodType.EGG].map((type) => (
                    <label key={type} className={form.foodType === type ? 'selected' : ''}>
                      <input
                        type="radio"
                        name="foodType"
                        value={type}
                        checked={form.foodType === type}
                        onChange={() => update('foodType', type)}
                      />
                      <span
                        className={`food-dot food-dot--${type.toLowerCase().replace('_', '-')}`}
                      />
                      {type === FoodType.NON_VEG
                        ? 'Non-veg'
                        : type === FoodType.EGG
                          ? 'Contains egg'
                          : 'Veg'}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="p40-field">
                <span className="p40-label">Preparation time</span>
                <span className="prep-input">
                  <Input
                    type="number"
                    min="1"
                    max="240"
                    value={form.preparationTimeMinutes}
                    onChange={(event) => update('preparationTimeMinutes', event.target.value)}
                    required
                  />
                  <span>minutes</span>
                </span>
              </label>
            </div>
            <div className="menu-item-form__side">
              <div className="p40-field">
                <span className="p40-label">
                  Item image <small>Recommended</small>
                </span>
                <label className={`menu-image-upload ${preview ? 'has-image' : ''}`}>
                  {preview ? (
                    <span
                      className="menu-image-upload__preview"
                      style={{ backgroundImage: `url(${preview})` }}
                    />
                  ) : (
                    <>
                      <span className="menu-image-upload__icon">
                        <ImagePlus size={26} />
                      </span>
                      <strong>Add a food photo</strong>
                      <small>JPG, PNG or WebP · max 5 MB</small>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={selectImage}
                  />
                  <span className="menu-image-upload__button">
                    <Upload size={16} />
                    {preview ? 'Change image' : 'Upload image'}
                  </span>
                </label>
              </div>
              <div className="availability-card">
                <div>
                  <strong>Availability</strong>
                  <span>Customers can order this item</span>
                </div>
                <label className="menu-switch">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(event) => update('isAvailable', event.target.checked)}
                  />
                  <span />
                </label>
              </div>
              <div className="menu-tip">
                <strong>Tip for better sales</strong>
                <p>
                  Use a clear, well-lit photo and a concise description that highlights the dish.
                </p>
              </div>
            </div>
            {error ? (
              <div className="menu-form-error" role="alert">
                {error}
              </div>
            ) : null}
            <footer className="menu-dialog__footer">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !categories.length || !restaurants.length}
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="menu-spinner" size={17} />
                    Saving item...
                  </>
                ) : item ? (
                  'Save changes'
                ) : (
                  'Save item'
                )}
              </Button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
