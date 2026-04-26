'use client';

import { ReactNode, useState } from 'react';
import { TransferData } from '@/types';
import { getAccount, getAccounts } from '@/lib/storage';
import { CURRENCY } from '@/lib/common';

type Props = {
  data: TransferData,
  onSubmit: (id: string, otherId: string, amount: number) => void,
  onClose: () => void,
}

export const AccountTransferForm = ({ data, onSubmit, onClose }: Props): ReactNode => {
  const [amount, setAmount] = useState('');
  const account = getAccount(data.id);
  const otherAccounts = getAccounts().filter((a) => a.id !== data.id);
  const [otherAccountId, setOtherAccountId] = useState(otherAccounts[0].id);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!amount) return;

    onSubmit(data.id, otherAccountId, +amount);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>From account</label>
            <select
              value={data?.id}
              disabled
            >
              <option value={account?.id}>
                {account?.name}
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>To account</label>
            <select
              value={otherAccountId}
              onChange={(e) => setOtherAccountId(e.target.value)}
            >
              {otherAccounts.map((account, i) => (
                <option key={i} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Trasfer amount (${CURRENCY})</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountTransferForm;
