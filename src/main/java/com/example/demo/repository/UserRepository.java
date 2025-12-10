package com.example.demo.repository;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByTaiKhoan(String taiKhoan);
    boolean existsByTaiKhoan(String taiKhoan);
    List<User> findByTaiKhoanContainingOrTenHienThiContainingOrLienHeContaining(String taiKhoan, String tenHienThi, String lienHe);

    // Các phương thức cần thiết cho ChatService
    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u WHERE u.role.tenVaiTro = 'NV'")
    List<User> findEmployees();

    @Query("SELECT u FROM User u WHERE u.role.tenVaiTro = 'NTD'")
    List<User> findEmployers();

    // Tìm các ứng viên đã ứng tuyển vào công ty của nhà tuyển dụng cụ thể
    @Query("SELECT DISTINCT aj.employee FROM AppliedJob aj WHERE aj.jobDetail.company.user.maNguoiDung = :employerId")
    List<User> findApplicantsByEmployer(@Param("employerId") Integer employerId);
}