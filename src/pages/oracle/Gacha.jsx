import React from 'react';
import { PageShell, GachaBlock } from '../../components/oracle/parts.jsx';

export default function Gacha() {
  return (
    <PageShell area="/gacha">
      {({ lang, t }) => <GachaBlock lang={lang} t={t} />}
    </PageShell>
  );
}
