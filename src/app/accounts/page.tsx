'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AccountData, TransferData } from '@/types';
import AccountAddForm from '@/components/accounts/AccountForm';
import AccountsTotal from '@/components/accounts/AccountsTotal';
import { addAccount, deleteAccount, getAccounts, makeAccountTransfer, updateAccount } from '@/lib/storage';
import AccountTotal from '@/components/accounts/AccountTotal';
import AccountTransferForm from '@/components/accounts/AccountTransferForm';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountData[]>(getAccounts());
  const [showForm, setShowForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [formData, setFormData] = useState<AccountData | null>(null);
  const [transferFormData, setTransferFormData] = useState<TransferData>({ id: '' });

  const handleAdd = (accountData: AccountData, isUpdate: boolean) => {
    if (isUpdate) {
      return handleUpdate(accountData);
    }

    const updated = addAccount(accountData);
    setAccounts(updated);
  }

  const handleUpdate = async (accountData: AccountData) => {
    const updated = await updateAccount(accountData);
    setAccounts(updated);
  }

  const handleDelete = (id: string) => {
    const updated = deleteAccount(id);
    setAccounts(updated);
  }

  const handleTransfer = async (id: string, otherId: string, amount: number) => {
    const updated = await makeAccountTransfer(id, otherId, amount);
    setAccounts(updated);
  }

  const getTotal = () => {
    if (accounts.length === 0) return 0;
    return accounts.reduce((acc, curr) => +(acc + curr.total), 0)
  }

  return (
    <>
      <div className="page-header">
        <h1>Accounts</h1>
        <p>Monitor your spendings, set spending limits, track your progress!</p>
      </div>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          flexWrap: 'wrap',
        }}
      >
        <AccountsTotal total={getTotal()} />
      </div>

      {/* Budget Cards */}
      {accounts.length === 0 ? (
        <div className="empty-state">
          <p>No accounts yet. Create one!</p>
        </div>
      ) : (
        <div className="budget-grid">
          {accounts.map((item, i) => (
            <AccountTotal
              {...item}
              onDelete={handleDelete}
              onTransferClick={() => {
                setTransferFormData({ id: item.id });
                setShowTransferForm(true);
              }}
              onClick={() => {
                setFormData(item);
                setShowForm(true);
              }}
              key={i}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowForm(true)} title="Add budget plan">
        <Plus size={24} />
      </button>

      {/* Modals */}
      {showForm && (
        <AccountAddForm
          data={formData}
          onSubmit={handleAdd}
          onClose={() => {
            setShowForm(false);
            setFormData(null);
          }}
        />
      )}
      {showTransferForm && (
        <AccountTransferForm
          data={transferFormData}
          onSubmit={(...args) => handleTransfer(...args)}
          onClose={() => setShowTransferForm(false)}
        />
      )}
    </>
  );
}
