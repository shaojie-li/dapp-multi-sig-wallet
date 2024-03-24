import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { getUsers } from '@/model/user';
import type { users as Users } from '@prisma/client';
import LoginBtn from '@/components/login-btn'
import Head from 'next/head'

export async function getServerSideProps() {
  try {
    const users = await getUsers();
    return { props: { 
      users: users.map(user => ({
        ...user, 
        created_at: user.created_at ? new Date(user.created_at).getTime() : null
    })) 
  }}
  } catch (error) {
    console.log('error', error);
    return { props: { users: [{id: 1}] }}
  }
}

interface Props {
  ban: string
  users: Users[]
}

const UserPage: React.FC<Props> = ({ ban, users }) => {
  const pathname = usePathname()
  const [label, setLabel] = useState('start')

  return (
    <div>
      <Head>
        <title>My user page</title>
      </Head>
      <LoginBtn></LoginBtn>
      <h5 onClick={() => alert(1)} className="text-blue-500">user: {pathname}</h5>
      <input type="text" value={label} onChange={e => setLabel(e.target.value)} />
      {label && label !== 'start' && <span style={{ color: 'red' }}>{label}</span>}
      <div>
        <ul>
          {
            users.map(user => <li suppressHydrationWarning key={user.uuid}>{user.id} {user.uuid} {user.avatar_url} -- {user.created_at ? new Date(user.created_at).toLocaleString() : '--'}</li>)
          }
        </ul>
      </div>
    </div>
  )
}

export default UserPage;
