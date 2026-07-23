package p1;

import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Scanner sc = new Scanner(System.in);
		StudentDAO dao = new StudentDAO();
		
		while(true){
			System.out.println("\n***********Student  Management System*************");
			System.out.println("Enter 1 To ADD Studnet\n 2 To Update\n 3 To Delete\n 4 To Find Student\n 5 To FindAllStudent ");
			
			System.out.print("\nEnter your Choice : ");
			int Choice = sc.nextInt();
			switch(Choice){
				
			
			case 1:
				System.out.print("Enter ID :");
				int id = sc.nextInt();
				sc.nextLine();
				System.out.println("Enter NAME:");
				String name = sc.nextLine();
				System.out.println("Enter COURSE :");
				String course = sc.nextLine();
				
				Student student = new Student(id, name , course);
				dao.insert(student);
				break;
				
			case 2:
				System.out.println("Enter ID TO Update:");
				int uid =  sc.nextInt();
				sc.nextLine();
				
				System.out.println("Enter NewName : ");
				String uname = sc.nextLine();
				System.out.println("Entee NewCourse : ");
				String ucourse = sc.nextLine();
				
				dao.update(uid, uname, ucourse);
				break;
				
			case 3:
				System.out.println("Enter ID to Delete :");
				dao.delete(sc.nextInt());
				break;
				
			case 4:
				System.out.println("Enter ID to Find student :");
				dao.findById(sc.nextInt());
				break;
				
			case 5:
				dao.findAll();
				break;
				
			case 6:
				System.out.println("Thank You");
				sc.close();
				break;
			
			default:
				System.out.println("Invalid choice\n Please Choose above listed numbers only");
			}
		}
		
	}

}
