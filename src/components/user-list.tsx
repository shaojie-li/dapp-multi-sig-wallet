import type { users as Users, users } from '@prisma/client';
import Head from 'next/head';
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const UserList: React.FC = () => {
  const { data, error, isLoading } = useSWR<users[]>('/api/get-user', fetcher, {
    refreshInterval: 1000,
  })
  
  return (
    <div>
      <Head>
        <title>My user page</title>
      </Head>

      <div>
       {isLoading && !data ? 'loading' : <ul>
          {
            data?.map(user => <li suppressHydrationWarning key={user.uuid}>{user.id} {user.uuid} {user.avatar_url} -- {user.created_at ? new Date(user.created_at).toLocaleString() : '--'}</li>)
          }
        </ul>}
        {error && JSON.stringify(error)}
      </div>
    </div>
  )
}

export default UserList;
