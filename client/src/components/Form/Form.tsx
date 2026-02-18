import React from 'react';
import './Form.scss';

interface FormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  name: string;
}

const Form: React.FC<FormProps> = ({ onSubmit, children, name }) => {
  return (
    <form
      action="#"
      className="form"
      name={name}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};

export default Form;