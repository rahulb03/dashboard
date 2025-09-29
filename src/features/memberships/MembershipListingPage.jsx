'use client';

import { MembershipTable } from './MembershipTable';
import { columns } from './MembershipTableColumns';

export default function MembershipListingPage() {
  return <MembershipTable columns={columns} />;
}