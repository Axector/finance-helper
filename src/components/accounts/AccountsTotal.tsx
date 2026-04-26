import { ReactNode } from 'react';
import { DollarSign } from 'lucide-react';
import { CURRENCY } from '@/lib/common';

type AccountsTotalProps = {
  total: number;
}

export const AccountsTotal = ({ total }: AccountsTotalProps): ReactNode => {
  const formatTotal = (total: number): string => {
    return parseFloat(`${total}`).toFixed(2) + CURRENCY;
  }

  return (
    <div className={`card stat-card account-total-card purple`}>
      <div className="stat-icon"><DollarSign size={20} /></div>
      <div className="stat-label">Total Balance</div>
      <div className="stat-value">{formatTotal(total)}</div>
    </div>
  );
}

export default AccountsTotal;
