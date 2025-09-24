'use client';

import { MemberTable } from './MemberTable';
import { columns } from './MemberTableColumns';

export default function MemberListingPage() {
  return <MemberTable columns={columns} />;
}
