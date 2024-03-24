"use client";
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { users as Users } from '@prisma/client';
import Head from 'next/head';
import UserList from '@/components/user-list';


const UserPage: React.FC = () => {
  const pathname = usePathname()
  const [label, setLabel] = useState('start')

  return (
    <div>
      <Head>
        <title>My user page</title>
      </Head>

      <h5 onClick={() => alert(1)} className="text-blue-500">user: {pathname}</h5>
      <input type="text" value={label} onChange={e => setLabel(e.target.value)} />
      {label && label !== 'start' && <span style={{ color: 'red' }}>{label}</span>}
      <UserList></UserList>
    </div>
  )
}

export default UserPage;
