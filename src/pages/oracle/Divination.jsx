import React from 'react';
import { PageShell, OracleBlock } from '../../components/oracle/parts.jsx';

export default function Divination() {
  return (
    <PageShell area="/divination">
      {({ lang, t }) => <OracleBlock lang={lang} t={t} />}
    </PageShell>
  );
}
