package p1;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class StudentDAO {   //DAO Data Access Object
	public void insert(Student s) {
		String sql = "INSERT INTO STUDENT3 (ID,SNAME,COURSE) VALUES (?,?,?)";
		try(Connection con = DBConnection.getConnection();
				PreparedStatement pst = con.prepareStatement(sql)){
			pst.setInt(1, s.getSid());
			pst.setString(2, s.getSname());
			pst.setString(3, s.getCourse());
			pst.executeUpdate();
			System.out.println("Inserted Successfully");
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public void update(int sid, String sname, String course) {
		String sql =  "UPDATE STUDENT3 SET SNAME=?,COURSE=? WHERE ID=?";
		try(Connection con = DBConnection.getConnection();
				PreparedStatement pst = con.prepareStatement(sql)){
			pst.setString(1, sname);
			pst.setString(2, course);
			pst.setInt(3, sid);
			pst.executeUpdate();
			System.out.println("Updated Successfully");	
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public void delete(int sid) {
		String sql = "DELETE FROM STUDENT3 WHERE ID=?";
		try(Connection con =DBConnection.getConnection();
				PreparedStatement pst = con.prepareStatement(sql)){
			pst.setInt(1, sid);
			
			int row = pst.executeUpdate();
			if(row>0) {
			System.out.println("Deleted Successfully!!!");
			}else {
				System.out.println("Student Not Found");
			}
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public void findById(int sid) {
		String sql = "SELECT * FROM STUDENT3 WHERE ID=?";
		try(Connection con =  DBConnection.getConnection();
				PreparedStatement pst = con.prepareStatement(sql)){
			pst.setInt(1, sid);
			ResultSet rs = pst.executeQuery();
			if(rs.next()) {
				System.out.println("=========Student Detail===========");
				System.out.println("student id :"+rs.getInt("ID"));
				System.out.println("Student name:"+rs.getString("SNAME"));
				System.out.println("Student course:"+rs.getString("COURSE"));
			}else {
				System.out.println("Student Not found");
			}	
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public void findAll() {
		String sql = "SELECT * FROM STUDENT3";
		try(Connection con = DBConnection.getConnection();
				PreparedStatement pst = con.prepareStatement(sql)){
			ResultSet rs =  pst.executeQuery();
			while(rs.next()) {
				System.out.println("=========Student Detail===========");
				System.out.println("student id :"+rs.getInt("ID"));
				System.out.println("Student name:"+rs.getString("SNAME"));
				System.out.println("Student course:"+rs.getString("COURSE"));
			}
			
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
}
