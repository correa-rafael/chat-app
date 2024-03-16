// utils/auth.ts

interface User {
    username: string;
    password: string;
  }
  
  export const authenticate = (username: string, password: string): boolean => {
    // Define your list of users with their passwords here
    const users: User[] = [
      { username: "user1", password: "password1" },
      { username: "user2", password: "password2" },
      // Add more users as needed
    ];
  
    // Check if the provided username and password match any user in the list
    return users.some((user) => user.username === username && user.password === password);
  };
  