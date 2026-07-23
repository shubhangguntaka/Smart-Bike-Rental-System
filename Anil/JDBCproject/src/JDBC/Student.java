package JDBC;

public class Student {

	private int studentId;
	private String StudentName;
	private String  college;
	private int age;
	public int getStudentId() {
		return studentId;
	}
	public void setStudentId(int studentId) {
		this.studentId = studentId;
	}
	public String getStudentName() {
		return StudentName;
	}
	public void setStudentName(String studentName) {
		StudentName = studentName;
	}
	public String getCollege() {
		return college;
	}
	public void setCollege(String college) {
		this.college = college;
	}
	public int getAge() {
		return age;
	}
	public void setAge(int age) {
		this.age = age;
	}
	public Student(int studentId, String studentName, String college, int age) {
		super();
		this.studentId = studentId;
		StudentName = studentName;
		this.college = college;
		this.age = age;
	}
	
	
}
