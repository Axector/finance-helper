import { ReactNode } from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { CURRENCY } from '@/lib/common';

type AccountTotalProps = {
  id: string,
  name: string,
  total: number,
  openDate: string,
  onDelete: (id: string) => void,
  onTransferClick: () => void,
  onClick: () => void,
}

export const AccountTotal = ({ id, name, total, openDate, onDelete, onTransferClick, onClick }: AccountTotalProps): ReactNode => {
  const formatTotal = (total: number): string => {
    return parseFloat(`${total}`).toFixed(2) + CURRENCY;
  }

  const formatDate = (date: string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }

  return (
    <div className="account-card-wrapper">
      <button className={`card stat-card account-card green`} onClick={onClick}>
        <div className="stat-label">{name}</div>
        <div className="stat-value">{formatTotal(total)}</div>
        <div className="stat-sub">Opened: {formatDate(openDate)}</div>
      </button>
      <button
        className="stat-delete"
        onClick={() => onDelete(id)}
        title="Delete account"
      >
        <Trash2 size={16} />
      </button>
      <button
        className="stat-transfer"
        onClick={onTransferClick}
        title="Transfer to different account"
      >
        Transfer <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default AccountTotal;
