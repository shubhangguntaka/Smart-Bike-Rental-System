package sqloperations;

import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        StudentDBO dbo = new StudentDBO();

        while (true) {
        	System.out.println("Student Management System");
        	System.out.println("\n1. Add\n2. Update\n3. Delete\n4. Find\n5. Find All\n6. Exit");
            System.out.print("Enter choice: ");

            int choice = sc.nextInt();

            switch (choice) {

            case 1:
                System.out.print("Enter id: ");
                int id = sc.nextInt();
                sc.nextLine();

                System.out.print("Enter name: ");
                String name = sc.nextLine();

                System.out.print("Enter email: ");
                String email = sc.nextLine();

                System.out.print("Enter course: ");
                String course = sc.nextLine();

                dbo.insert(new Student(id, name, email, course));
                break;

            case 2:
                System.out.print("Enter id: ");
                int uid = sc.nextInt();
                sc.nextLine();

                System.out.print("Enter name: ");
                String uname = sc.nextLine();

                System.out.print("Enter email: ");
                String uemail = sc.nextLine();

                System.out.print("Enter course: ");
                String ucourse = sc.nextLine();

                dbo.updateStudent(uid, uname, uemail, ucourse);
                break;

            case 3:
                System.out.print("Enter id: ");
                dbo.deleteStudent(sc.nextInt());
                break;

            case 4:
                System.out.print("Enter id: ");
                dbo.findStudent(sc.nextInt());
                break;

            case 5:
                dbo.findAllStudents();
                break;

           

            default:
                System.out.println("Invalid Choice");
            }
        }
    }
}