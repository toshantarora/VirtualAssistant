import React from 'react';
import UserModal from '../../components/UserModal';
import AddUserForm from '../../components/AddUserForm';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AddUser = () => {
  useDocumentTitle('Add User', 'Add a new user to the system');
  return (
    <div className="p-2">
      <AddUserForm />
    </div>
  );
};

export default AddUser;
