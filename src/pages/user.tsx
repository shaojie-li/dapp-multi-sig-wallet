import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { GetStaticPropsContext } from "next";
import { getUsers } from '@/model/user';
import type { users as Users } from '@prisma/client';

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
      <h5 onClick={() => alert(1)}>user: {pathname} {ban}</h5>
      <input type="text" value={label} onChange={e => setLabel(e.target.value)} />
      <div>
        <ul>
          {
            users.map(user => <li key={user.uuid}>{user.id} {user.uuid} {user.avatar_url} -- {user.created_at ? new Date(user.created_at).toLocaleString() : '--'}</li>)
          }
        </ul>
      </div>
    </div>
  )
}

export default UserPage;