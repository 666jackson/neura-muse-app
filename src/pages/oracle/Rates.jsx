import React from 'react';
import { PageShell, RateWall } from '../../components/oracle/parts.jsx';

export default function Rates() {
  return (
    <PageShell area="/rates">
      {({ lang, t }) => <RateWall t={t} />}
    </PageShell>
  );
}
