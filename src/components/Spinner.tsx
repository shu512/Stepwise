export const Spinner = () => (
  <span
    style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      border: '2px solid #4caf50',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle',
    }}
  />
);
