export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    SALES = "sales"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
