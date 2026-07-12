import React from 'react';
import { PageShell, VaultBlock } from '../../components/oracle/parts.jsx';

export default function Vault() {
  return (
    <PageShell area="/vault">
      {({ lang, t }) => <VaultBlock lang={lang} t={t} />}
    </PageShell>
  );
}
