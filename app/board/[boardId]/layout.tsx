interface BoardLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function BoardLayout({ children, modal }: BoardLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
