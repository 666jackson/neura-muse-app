import React from 'react';
import { PageShell, DailyBlock } from '../../components/oracle/parts.jsx';

export default function DailyMuse() {
  return (
    <PageShell area="/daily">
      {({ lang, t }) => <DailyBlock lang={lang} t={t} />}
    </PageShell>
  );
}
