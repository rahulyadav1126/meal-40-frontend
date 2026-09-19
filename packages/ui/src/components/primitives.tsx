import type { ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { AlertCircle, Inbox, Search } from 'lucide-react';
import { OrderStatus, PaymentStatus } from '@plate40/types';
import { cn, formatCurrency, humanize } from '@plate40/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'operational' | 'danger';

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={cn('p40-button', `p40-button--${variant}`, className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('p40-input', className)} {...props} />;
}

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ position: 'relative', display: 'block' }}>
      <Search
        aria-hidden
        size={18}
        style={{ position: 'absolute', left: 13, top: 13, color: '#64748b' }}
      />
      <Input {...props} type="search" style={{ paddingLeft: 40, ...props.style }} />
    </label>
  );
}

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={cn('p40-card', className)} {...props}>
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = 'indigo',
  className,
}: {
  children: ReactNode;
  tone?: 'success' | 'warning' | 'indigo' | 'danger';
  className?: string;
}) {
  return <span className={cn('p40-badge', `p40-badge--${tone}`, className)}>{children}</span>;
}

const ORDER_TONE: Record<OrderStatus, 'success' | 'warning' | 'indigo' | 'danger'> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.ACCEPTED]: 'indigo',
  [OrderStatus.PREPARING]: 'warning',
  [OrderStatus.READY]: 'indigo',
  [OrderStatus.ASSIGNED]: 'indigo',
  [OrderStatus.PICKED_UP]: 'indigo',
  [OrderStatus.OUT_FOR_DELIVERY]: 'indigo',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'danger',
  [OrderStatus.REJECTED]: 'danger',
  [OrderStatus.REFUNDED]: 'danger',
};

const PAYMENT_TONE: Record<PaymentStatus, 'success' | 'warning' | 'indigo' | 'danger'> = {
  [PaymentStatus.PENDING]: 'warning',
  [PaymentStatus.AUTHORIZED]: 'indigo',
  [PaymentStatus.PAID]: 'success',
  [PaymentStatus.FAILED]: 'danger',
  [PaymentStatus.REFUNDED]: 'danger',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'warning',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_TONE[status]}>{humanize(status)}</Badge>;
}
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_TONE[status]}>{humanize(status)}</Badge>;
}

export function Price({ value, className }: { value: string | number; className?: string }) {
  return <span className={className}>{formatCurrency(value)}</span>;
}

export function FoodTypeIndicator({ vegetarian }: { vegetarian: boolean }) {
  return (
    <span
      aria-label={vegetarian ? 'Vegetarian' : 'Non vegetarian'}
      style={{
        width: 15,
        height: 15,
        border: `1.5px solid ${vegetarian ? '#10b981' : '#e11d48'}`,
        borderRadius: 3,
        display: 'inline-grid',
        placeItems: 'center',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: vegetarian ? '50%' : 1,
          background: vegetarian ? '#10b981' : '#e11d48',
          transform: vegetarian ? undefined : 'rotate(45deg)',
        }}
      />
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="p40-page-header">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p40-empty">
      <Inbox size={28} aria-hidden />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </Card>
  );
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
}: {
  message?: string;
}) {
  return (
    <Card className="p40-empty" role="alert">
      <AlertCircle size={28} color="#e11d48" aria-hidden />
      <h3>Unable to load</h3>
      <p>{message}</p>
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-label="Loading" className={cn('p40-skeleton', className)} />;
}

export function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p40-stat">
      <div className="p40-stat__top">
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </Card>
  );
}
