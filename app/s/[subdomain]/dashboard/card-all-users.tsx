"use client";
function AllUserOfApp({ users }: { users: unknown }) {
  return <div>{users ? JSON.stringify(users) : "Loading..."}</div>;
}

export default AllUserOfApp;
