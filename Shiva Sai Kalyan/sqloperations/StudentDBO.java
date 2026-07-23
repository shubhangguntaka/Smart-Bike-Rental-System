package sqloperations;

import java.sql.*;

public class StudentDBO {

    public void insert(Student s) {
        String sql = "INSERT INTO student1 VALUES (?, ?, ?, ?)";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, s.getId());
            ps.setString(2, s.getName());
            ps.setString(3, s.getEmail());
            ps.setString(4, s.getCourse());

            ps.executeUpdate();
            System.out.println("Inserted Successfully");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void updateStudent(int id, String name, String email, String course) {
        String sql = "UPDATE student1 SET sname=?, email=?, course=? WHERE sid=?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, course);
            ps.setInt(4, id);

            System.out.println(ps.executeUpdate() > 0
                    ? "Updated Successfully"
                    : "Student Not Found");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void deleteStudent(int id) {
        String sql = "DELETE FROM student1 WHERE sid=?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            System.out.println(ps.executeUpdate() > 0
                    ? "Deleted Successfully"
                    : "Student Not Found");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void findStudent(int id) {
        String sql = "SELECT * FROM student1 WHERE sid=?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                System.out.println(
                        rs.getInt("sid") + " " +
                        rs.getString("sname") + " " +
                        rs.getString("email") + " " +
                        rs.getString("course")
                );
            } else {
                System.out.println("Student Not Found");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void findAllStudents() {
        String sql = "SELECT * FROM student1";

        try (Connection con = DBConnection.getConnection();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                System.out.println(
                        rs.getInt("sid") + " " +
                        rs.getString("sname") + " " +
                        rs.getString("email") + " " +
                        rs.getString("course")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}