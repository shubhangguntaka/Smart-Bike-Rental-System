package JDBC;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class StudentDAO {
	public void insert(Student s) {
		String sql="INSERT INTO student1 (StudentId,StudentName,College,age) Values(?,?,?,?)";
		try(Connection con=DBConnection.getConnection();
				PreparedStatement ps=con.prepareStatement(sql)){
			ps.setInt(1, s.getStudentId());
			ps.setString(2, s.getStudentName());
			ps.setString(3, s.getCollege());
			ps.setInt(4, s.getAge());
			ps.executeUpdate();
			System.out.println("Inserted successfully");	
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	public void update(int studentId,String StudentName,String college,int age) {
		
		String sql="UPDATE student1 SET StudentName=?,College=?,Age=? WHERE StudentId=?";
		try(Connection con=DBConnection.getConnection();
				PreparedStatement ps=con.prepareStatement(sql)){
			
			ps.setString(1, StudentName );
			ps.setString(2,college);
			ps.setInt(3,age);
			ps.setInt(4,studentId);
			ps.executeUpdate();
			System.out.println("Updated successfully");
			
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}
	public void delete(int studentId) {
		
		String sql="DELETE from student1 WHERE StudentId=?";
		try(Connection con=DBConnection.getConnection();
				PreparedStatement ps=con.prepareStatement(sql)){
			
		
			ps.setInt(1,studentId);
			int row=ps.executeUpdate();
			
			if(row>0) {
				System.out.println("Delete Successfully");
			}
			else {
			System.out.println("Not found");
			}
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}
	public void findById(int studentId){
		String sql="SELECT * from student1 WHERE studentId=?";
		try(Connection con=DBConnection.getConnection();
				PreparedStatement ps=con.prepareStatement(sql)){
			ps.setInt(1,studentId);
			ResultSet rs=ps.executeQuery();
			if(rs.next()) {
				System.out.println("======Student Details========");
				System.out.println("student Id:"+rs.getInt("studentId"));
				System.out.println("student name:"+rs.getString("StudentName"));
				System.out.println("student college:"+rs.getString("college"));
				System.out.println("student age:"+rs.getInt("age"));
				
			}
			else {
				System.out.println("student not found");
			}	
		}
		catch(Exception e) {
			e.printStackTrace();
		}
		
	}
	public void findAll() {
		String sql="SELECT * from student1";
		try(Connection con=DBConnection.getConnection();
				PreparedStatement ps=con.prepareStatement(sql)){
			ResultSet rs=ps.executeQuery();
			while(rs.next()) {
				System.out.println("======Student Details========");
				System.out.println("student Id:"+rs.getInt("studentId"));
				System.out.println("student name:"+rs.getString("StudentNAme"));
				System.out.println("student college:"+rs.getString("college"));
				System.out.println("student age:"+rs.getInt("age"));
				
			}
			
		
			
		}
		catch(Exception e) {
			e.printStackTrace();
		}
		
	}
}
