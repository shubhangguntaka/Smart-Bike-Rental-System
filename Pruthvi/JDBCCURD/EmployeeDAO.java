package JDBCCURD;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class EmployeeDAO {
	public void insert(Employee emp) {
		try {
			Connection con = DBConnection.getConnection();
			String sql = "insert into employee values(?,?,?)";
			PreparedStatement ps = con.prepareStatement(sql);
			ps.setInt(1,emp.getEmpId());
			ps.setString(2,emp.getEmpName());
			ps.setDouble(3, emp.getSalary());
			
			int rows = ps.executeUpdate();
			if(rows > 0) {
				System.out.println("Record Inserted");
			}
		}
		catch (Exception e) {
			e.printStackTrace();	
		}
	}
	public void delete(int id) {
		try {
			Connection con = DBConnection.getConnection();
			String sql = "Delete from employee where empid=?";
			PreparedStatement ps = con.prepareStatement(sql);
			ps.setInt(1, id);
			int rows = ps.executeUpdate();
			if(rows > 0) {
				System.out.println("Record Deleted");
			} else {
				System.out.println("Employee not found");
			}	
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}
	public void update(Employee emp) {
		try {
			Connection con = DBConnection.getConnection();
			String sql = "Update employee set empname=?, salary=?, empid=?";
			PreparedStatement ps = con.prepareStatement(sql);
			ps.setString(1,emp.getEmpName());
			ps.setDouble(2,emp.getSalary());
			ps.setInt(3,emp.getEmpId());
			int rows = ps.executeUpdate();
			if(rows > 0) {
				System.out.println("Records Updated");
			}
		}
		catch (Exception e) {
			e.printStackTrace();
		}
	}
	public void find(int id) {
		try {
			Connection con = DBConnection.getConnection();
			String sql = "Select * from employee where empid=?";
			PreparedStatement ps = con.prepareStatement(sql);
			ps.setInt(1,id);
			ResultSet rs = ps.executeQuery();
			if(rs.next()) {
				System.out.println("ID :" + rs.getInt("empid"));
				System.out.println("Name :" + rs.getString("empname"));
				System.out.println("Salary :" + rs.getDouble("salary"));
			} else {
				System.out.println("Employee Not found");
			}
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public void findAll() {
		try {
			Connection con = DBConnection.getConnection();
			String sql = "select * from employee";
			PreparedStatement st = con.prepareStatement(sql);
			ResultSet rs = st.executeQuery(sql);
		    while(rs.next()) {
		    	System.out.println(rs.getInt("empid") + " " + rs.getString("empname")+ " " + rs.getDouble("salary"));
		    }
		}
		catch(Exception e) {
			e.printStackTrace();	
		}
	}

}
