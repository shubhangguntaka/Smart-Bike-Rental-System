package JDBCCURD;

import java.util.Scanner;

public class Main {
	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		EmployeeDAO dao = new EmployeeDAO();
		while(true) {
			System.out.println("\n------- JDBC CURD -----");
			System.out.println("1.Insert");
			System.out.println("2.Delete");
			System.out.println("3.Update");
			System.out.println("4. Find");
			System.out.println("5. FindAll");
			System.out.println("6. Exit");
			
			System.out.print("Enter choice : ");
			
			int choice = sc.nextInt();
			
			switch(choice) {
			case 1:
				System.out.print("Enter Employee ID:");
				int id = sc.nextInt();
				sc.nextLine();
				System.out.print("Enter Employee Name:");
				String name = sc.nextLine();
				System.out.print("Enter Salary:");
				double salary = sc.nextDouble();
				dao.insert(new Employee(id,name,salary));
				break;
			case 2:
				System.out.println("Enter Employee ID: ");
				id= sc.nextInt();
				dao.delete(id);
				break;
			case 3:
				System.out.println("Enter Employee ID: ");
				id = sc.nextInt();
				sc.nextLine();
				System.out.println("Enter New Name: ");
				name = sc.nextLine();
				System.out.println("Enter New Salary: ");
				salary = sc.nextDouble();
				dao.update(new Employee(id,name,salary));
				break;
			case 4:
				System.out.println("Enter EMployee ID:");
				id = sc.nextInt();
				dao.find(id);
				break;
			case 5:
				dao.findAll();
				break;
			case 6:
				System.out.println("Thank You");
				System.exit(0);
			default :
				System.out.println("Invalid Choice");
			}
		}
	}

}
