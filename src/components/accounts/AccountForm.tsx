'use client';

import { ReactNode, useState } from 'react';
import { AccountData } from '@/types';
import { generateId } from '@/lib/storage';
import { CURRENCY, getCurrentDate } from '@/lib/common';

type Props = {
  data: AccountData | null,
  onSubmit: (accountData: AccountData, isUpdate: boolean) => void,
  onClose: () => void,
}

export const AccountAddForm = ({ data, onSubmit, onClose }: Props): ReactNode => {
  const [name, setName] = useState(data?.name ?? '');
  const [startingValue, setStartingValue] = useState(parseFloat(`${data?.total ?? 0}`).toFixed(2));
  const [openDate, setOpenDate] = useState(data?.openDate ?? getCurrentDate());

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name || !openDate) return;

    const accountData: AccountData = {
      id: data?.id ?? generateId(),
      name,
      total: +startingValue,
      openDate,
    };

    onSubmit(accountData, !!data);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Account Name"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              {!!data
                ? `New Total (${CURRENCY})`
                : `Starting Value (${CURRENCY})`
              }
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={startingValue}
              onChange={(e) => setStartingValue(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div className="form-group">
            <label>Open Date</label>
            <input
              type="date"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {!!data
                ? 'Update Account'
                : 'Create Account'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountAddForm;
