package JDBC;

import java.util.Scanner;

public class Main {
	public static void main(String args[]) {
		Scanner sc=new Scanner(System.in);
		StudentDAO dao=new StudentDAO();
		while(true) {
			System.out.println("************Student Details***********");
			System.out.println("Enter 1 to ADD\nEnter 2 to Update \nEnter 3 to delete \nEnter 4 to find by id\nEnter 5 to find all ");
			System.out.println("Enter the choice:");
			int Choice=sc.nextInt();
			switch(Choice) {
			case 1:
				System.out.println("Enter ID:");
				int id=sc.nextInt();
				sc.nextLine();
				System.out.println("Enter Name:");
				String name=sc.nextLine();
				System.out.println("Enter College:");
				String college=sc.nextLine();
				System.out.println("Enter Age:");
				int age=sc.nextInt();
				Student student = new Student(id,name,college,age);

				break;
			case 2:
				System.out.println("Enter Id to Update");
				int uid =sc.nextInt();
				sc.nextLine();
				System.out.println("Enter new Name:");
				String uname=sc.nextLine();
				System.out.println("Enter new college");
				String ucollege=sc.nextLine();
				System.out.println("Enter age to Update");
				int uage =sc.nextInt();
				dao.update(uid, uname, ucollege, uage);
				break;
			case 3:
				System.out.println("enter id to delete");
				dao.delete(sc.nextInt());
				break;
			case 4:
				System.out.println("enter id to find by id");
				dao.findById(sc.nextInt());
				break;
			case 5:
				System.out.println("Enter id to find all");
				dao.findAll();
				break;
				default:
					System.out.println("Invalid choice");
			}
			
		}
		
	}

}
