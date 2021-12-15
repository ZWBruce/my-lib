import { FC } from 'react';

const Cmp1: FC = () => {
  const arr = [11, 2, 3];
  return (
    <div>
      Cmp1
      {arr.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
      <input type="text" />
    </div>
  );
};

export default Cmp1;
