// Custom JavaScript for the job portal
document.addEventListener('DOMContentLoaded', function() {
    // Handle job application
    const applyButtons = document.querySelectorAll('.apply-btn');
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            if (!jobId) {
                alert('Không thể xác định công việc cần ứng tuyển');
                return;
            }
            
            // Confirmation for job application
            if (confirm('Bạn có chắc chắn muốn ứng tuyển vào công việc này?')) {
                // Submit application via AJAX
                fetch('/apply-job', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').getAttribute('content')
                    },
                    body: JSON.stringify({ jobId: jobId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Ứng tuyển thành công!');
                        this.disabled = true;
                        this.textContent = 'Đã ứng tuyển';
                    } else {
                        alert('Lỗi: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Có lỗi xảy ra khi ứng tuyển');
                });
            }
        });
    });
    
    // Handle job saving
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            if (!jobId) {
                alert('Không thể xác định công việc cần lưu');
                return;
            }
            
            // Toggle save status
            const isSaved = this.classList.contains('saved');
            const action = isSaved ? 'remove' : 'save';
            
            fetch('/save-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').getAttribute('content')
                },
                body: JSON.stringify({ jobId: jobId, action: action })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (isSaved) {
                        this.classList.remove('saved', 'text-danger');
                        this.classList.add('text-secondary');
                        this.innerHTML = '<i class="far fa-bookmark"></i> Lưu';
                    } else {
                        this.classList.remove('text-secondary');
                        this.classList.add('saved', 'text-danger');
                        this.innerHTML = '<i class="fas fa-bookmark"></i> Đã lưu';
                    }
                } else {
                    alert('Lỗi: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi lưu công việc');
            });
        });
    });
    
    // Handle responsive navigation
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            navbarCollapse.classList.toggle('show');
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Handle form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
    
    // Job search functionality
    let currentPage = 0;
    const searchForm = document.getElementById('job-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            currentPage = 0; // Reset to first page on new search

            // Get search parameters
            const keyword = document.getElementById('search-keyword') ? document.getElementById('search-keyword').value.trim() : '';
            const workField = document.getElementById('search-work-field') ? document.getElementById('search-work-field').value : '';
            const workType = document.getElementById('search-work-type') ? document.getElementById('search-work-type').value : '';

            // If keyword is empty, fetch all jobs; otherwise, perform search
            let apiUrl;
            if (!keyword && !workField && !workType) {
                // Fetch all jobs if no search criteria
                apiUrl = `/api/v1/job-details?page=${currentPage}&size=10`;
            } else if (!keyword && workField && !workType) {
                // Chỉ tìm theo lĩnh vực công việc
                apiUrl = `/api/v1/job-details/search-single?workField=${workField}&page=${currentPage}&size=10&sortBy=maCongViec`;
            } else if (!keyword && !workField && workType) {
                // Chỉ tìm theo hình thức làm việc
                apiUrl = `/api/v1/job-details/search-single?workType=${workType}&page=${currentPage}&size=10&sortBy=maCongViec`;
            } else if (!keyword && workField && workType) {
                // Tìm theo cả lĩnh vực công việc và hình thức làm việc (không áp dụng điều kiện trạng thái)
                apiUrl = `/api/v1/job-details/search-combined-correct?workField=${workField}&workType=${workType}&page=${currentPage}&size=10&sortBy=maCongViec`;
            } else {
                // Build query parameters for comprehensive search (có từ khóa)
                let params = new URLSearchParams();
                if (keyword) params.append('keyword', keyword);
                if (workField) params.append('workField', workField);
                if (workType) params.append('workType', workType);
                params.append('page', currentPage);
                params.append('size', 10);

                // Call API to search jobs with pagination
                const queryString = params.toString();
                apiUrl = `/api/v1/job-details/search-with-paging${queryString ? '?' + queryString : ''}`;
            }

            console.log('Calling API:', apiUrl); // Debug log
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                console.log('API Response Status:', response.status); // Debug log
                return response.json();
            })
            .then(data => {
                console.log('API Response Data:', data); // Debug log
                if (data.success) {
                    if (apiUrl.includes('/search-with-paging')) {
                        // Search results with pagination
                        if (data.data && data.data.content !== undefined) {
                            // Dữ liệu có phân trang
                            updateJobListings(data.data.content, data.data);
                        } else {
                            // Dữ liệu không có phân trang, là mảng trực tiếp
                            updateJobListings(data.data, null);
                        }
                    } else {
                        // All jobs results (from /api/v1/job-details endpoint)
                        updateJobListings(data.data, null);
                    }
                } else {
                    console.error('Search failed:', data.message);
                    alert('Đã xảy ra lỗi khi tìm kiếm công việc');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Đã xảy ra lỗi khi tìm kiếm công việc');
            });
        });
    } else {
        console.error('Search form not found!'); // Debug log
    }

    // Handle pagination clicks
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('page-number')) {
            event.preventDefault();
            const page = event.target.getAttribute('data-page');
            if (page !== null) {
                currentPage = parseInt(page);

                // Get current search parameters
                const keyword = document.getElementById('search-keyword') ? document.getElementById('search-keyword').value.trim() : '';
                const workField = document.getElementById('search-work-field') ? document.getElementById('search-work-field').value : '';
                const workType = document.getElementById('search-work-type') ? document.getElementById('search-work-type').value : '';

                // If keyword is empty, fetch all jobs; otherwise, perform search
                let apiUrl;
                if (!keyword && !workField && !workType) {
                    // Fetch all jobs if no search criteria
                    apiUrl = `/api/v1/job-details?page=${currentPage}&size=10`;
                } else if (!keyword && workField && !workType) {
                    // Chỉ tìm theo lĩnh vực công việc
                    apiUrl = `/api/v1/job-details/search-single?workField=${workField}&page=${currentPage}&size=10&sortBy=maCongViec`;
                } else if (!keyword && !workField && workType) {
                    // Chỉ tìm theo hình thức làm việc
                    apiUrl = `/api/v1/job-details/search-single?workType=${workType}&page=${currentPage}&size=10&sortBy=maCongViec`;
                } else if (!keyword && workField && workType) {
                    // Tìm theo cả lĩnh vực công việc và hình thức làm việc (không áp dụng điều kiện trạng thái)
                    apiUrl = `/api/v1/job-details/search-combined-correct?workField=${workField}&workType=${workType}&page=${currentPage}&size=10&sortBy=maCongViec`;
                } else {
                    // Build query parameters for comprehensive search
                    let params = new URLSearchParams();
                    if (keyword) params.append('keyword', keyword);
                    if (workField) params.append('workField', workField);
                    if (workType) params.append('workType', workType);
                    params.append('page', currentPage);
                    params.append('size', 10);

                    // Call API to search jobs with pagination
                    const queryString = params.toString();
                    apiUrl = `/api/v1/job-details/search-with-paging${queryString ? '?' + queryString : ''}`;
                }

                // Call API to get paginated results
                console.log('Calling API for pagination:', apiUrl); // Debug log
                fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => {
                    console.log('Pagination API Response Status:', response.status); // Debug log
                    return response.json();
                })
                .then(data => {
                    console.log('Pagination API Response Data:', data); // Debug log
                    if (data.success) {
                        if (apiUrl.includes('/search-with-paging')) {
                            // Search results with pagination
                            if (data.data && data.data.content !== undefined) {
                                // Dữ liệu có phân trang
                                updateJobListings(data.data.content, data.data);
                            } else {
                                // Dữ liệu không có phân trang, là mảng trực tiếp
                                updateJobListings(data.data, null);
                            }
                        } else {
                            // All jobs results (from /api/v1/job-details endpoint)
                            updateJobListings(data.data, null);
                        }
                        // Scroll to top of results
                        document.querySelector('.job-listings').scrollIntoView({ behavior: 'smooth' });
                    } else {
                        console.error('Search failed:', data.message);
                        alert('Đã xảy ra lỗi khi tìm kiếm công việc');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Đã xảy ra lỗi khi tìm kiếm công việc');
                });
            }
        }
    });

    // Function to update job listings on the page
    function updateJobListings(jobs, pagination = null) {
        const jobListingsContainer = document.querySelector('.job-listings');
        if (!jobListingsContainer) {
            // If no specific container exists, create one or update the main content area
            const mainContent = document.querySelector('main.container .row > div:first-child');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="section-title mb-0">Kết quả tìm kiếm</h2>
                        <p class="mb-0">Tìm thấy <strong>${jobs.length}</strong> việc làm</p>
                    </div>
                    <div class="job-listings">
                        ${jobs.length > 0
                            ? jobs.map(job => createJobCard(job)).join('')
                            : '<div class="text-center py-5"><i class="fas fa-inbox fa-5x text-muted mb-4"></i><h4 class="text-muted">Không tìm thấy việc làm phù hợp</h4><p class="text-muted">Vui lòng thử lại với từ khóa khác</p></div>'
                        }
                    </div>
                    ${pagination ? createPagination(pagination) : ''}
                `;
            }
        } else {
            jobListingsContainer.innerHTML = jobs.length > 0
                ? jobs.map(job => createJobCard(job)).join('')
                : '<div class="text-center py-5"><i class="fas fa-inbox fa-5x text-muted mb-4"></i><h4 class="text-muted">Không tìm thấy việc làm phù hợp</h4><p class="text-muted">Vui lòng thử lại với từ khóa khác</p></div>';

            // Add pagination if available
            if (pagination) {
                const paginationContainer = document.querySelector('.pagination-container');
                if (paginationContainer) {
                    paginationContainer.innerHTML = createPagination(pagination);
                } else {
                    // Create pagination container if it doesn't exist
                    const paginationHTML = `
                        <div class="pagination-container mt-4">
                            ${createPagination(pagination)}
                        </div>
                    `;
                    document.querySelector('main.container .row > div:first-child').innerHTML += paginationHTML;
                }
            }
        }
    }

    // Function to create pagination HTML
    function createPagination(pagination) {
        if (pagination.totalPages <= 1) return '';

        let paginationHTML = '<nav aria-label="Page navigation"><ul class="pagination justify-content-center">';

        // Previous button
        if (!pagination.first) {
            paginationHTML += `<li class="page-item"><a class="page-link page-number" href="#" data-page="${pagination.number - 1}">Trước</a></li>`;
        } else {
            paginationHTML += '<li class="page-item disabled"><a class="page-link" href="#">Trước</a></li>';
        }

        // Page numbers
        const startPage = Math.max(0, pagination.number - 2);
        const endPage = Math.min(pagination.totalPages - 1, pagination.number + 2);

        for (let i = startPage; i <= endPage; i++) {
            if (i === pagination.number) {
                paginationHTML += `<li class="page-item active"><a class="page-link page-number" href="#" data-page="${i}">${i + 1}</a></li>`;
            } else {
                paginationHTML += `<li class="page-item"><a class="page-link page-number" href="#" data-page="${i}">${i + 1}</a></li>`;
            }
        }

        // Next button
        if (!pagination.last) {
            paginationHTML += `<li class="page-item"><a class="page-link page-number" href="#" data-page="${pagination.number + 1}">Sau</a></li>`;
        } else {
            paginationHTML += '<li class="page-item disabled"><a class="page-link" href="#">Sau</a></li>';
        }

        paginationHTML += '</ul></nav>';

        return paginationHTML;
    }

    // Function to create a job card HTML element
    function createJobCard(job) {
        // Format salary with Vietnamese currency format
        const salaryText = job.luong
            ? `<i class="fas fa-dollar-sign me-1"></i>${job.luong} triệu VNĐ`
            : '<i class="fas fa-dollar-sign me-1"></i>Lương thỏa thuận';

        // Format publication date
        const publishDate = job.ngayDang ? new Date(job.ngayDang).toLocaleDateString('vi-VN') : 'N/A';
        const expiryDate = job.ngayKetThucTuyenDung ? new Date(job.ngayKetThucTuyenDung).toLocaleDateString('vi-VN') : 'Không xác định';

        return `
            <div class="card card-shadow job-card mb-4">
                <div class="card-body">
                    <div class="d-flex align-items-start mb-3">
                        <div class="flex-shrink-0">
                            ${job.company && job.company.hinhAnhCty
                                ? `<img src="${job.company.hinhAnhCty}" alt="Logo" class="company-logo">`
                                : '<i class="fas fa-building fa-2x text-primary"></i>'
                            }
                        </div>
                        <div class="flex-grow-1 ms-3">
                            <h5 class="card-title mb-1">
                                <a href="/jobs/${job.maCongViec}"
                                   class="text-decoration-none text-dark">
                                    ${job.tieuDe}
                                </a>
                            </h5>
                            <h6 class="text-muted mb-0">${job.company ? job.company.tenCongTy : 'N/A'}</h6>
                        </div>
                    </div>

                    <p class="salary mb-2">${salaryText}</p>

                    <p class="card-text text-muted mb-3">${truncateText(job.chiTiet, 150)}</p>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="job-location">
                            <i class="fas fa-map-marker-alt me-1"></i> ${job.company ? job.company.diaChi : 'N/A'}
                        </span>
                        <span class="job-type">${job.workType ? job.workType.tenHinhThuc : 'N/A'}</span>
                    </div>

                    <div class="d-flex justify-content-between">
                        <small class="text-muted">
                            <i class="fas fa-calendar-alt me-1"></i>
                            ${publishDate}
                        </small>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            ${expiryDate}
                        </small>
                    </div>

                    <div class="card-footer bg-transparent border-0 mt-3 p-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="badge bg-success" ${job.trangThaiDuyet === 'Đã duyệt' ? '' : 'style="display:none;"'}>Đã duyệt</span>
                                <span class="badge bg-primary" ${job.trangThaiTinTuyen === 'Mở' ? '' : 'style="display:none;"'}>Mở</span>
                            </div>
                            <a href="/jobs/${job.maCongViec}" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-eye me-1"></i>Xem chi tiết
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to truncate text
    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
    }
    
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Handle image preview for file uploads
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('imagePreview').src = event.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }
});

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(notification);
        bsAlert.close();
    }, 5000);
}

function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}