// app.js
document.addEventListener("DOMContentLoaded", function() {
    // Replace with your actual API key
    const API_KEY = 'caof23MEffltOqJfUdFLcPdujqPtmABupKlWswZ8';
    const baseUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools';
    const tableBody = document.getElementById('table-body');
  
    // Build base query parameters – no filtering so all schools are returned.
    const params = new URLSearchParams();
    params.append('api_key', API_KEY);
    // Set maximum results per page
    params.append('per_page', '100');
    // Request fields based on your data dictionary:
    // • school.name
    // • School type: school.ownership (1 = Public, 2 = Private Nonprofit, 3 = Private For-Profit)
    // • Enrollment: latest.student.size
    // • Graduation Rate: latest.completion_rate_4yr_150nt
    // • Retention Rate: latest.retention_rate.four_year.full_time
    // • Bachelor's Offered: school.degrees_awarded.predominant (if equals 3 then Yes)
    params.append('fields', 'id,school.name,school.ownership,latest.student.size,latest.completion_rate_4yr_150nt,latest.retention_rate.four_year.full_time,school.degrees_awarded.predominant');
  
    // Function to fetch one page given a page number.
    function fetchPage(page) {
      const pageParams = new URLSearchParams(params);
      pageParams.set('page', page);
      return fetch(`${baseUrl}?${pageParams.toString()}`)
        .then(response => response.json());
    }
  
    // First, fetch page 0 to get metadata and initial results.
    fetchPage(0)
      .then(initialData => {
        if (initialData.error || initialData.errors) {
          let errorMessage = initialData.error ? initialData.error.message : initialData.errors.map(err => err.message).join(", ");
          tableBody.innerHTML = `<tr><td colspan="6" class="px-4 py-2 text-red-600">API Error: ${errorMessage}</td></tr>`;
          console.error("API Error:", initialData);
          return Promise.reject("API Error");
        }
        const total = initialData.metadata.total;
        const perPage = parseInt(initialData.metadata.per_page);
        const totalPages = Math.ceil(total / perPage);
        let allResults = initialData.results || [];
  
        let requests = [];
        // Fetch remaining pages (pages 1 to totalPages - 1)
        for (let i = 1; i < totalPages; i++) {
          requests.push(fetchPage(i));
        }
        return Promise.all(requests).then(pages => {
          pages.forEach(pageData => {
            if (pageData.results && Array.isArray(pageData.results)) {
              allResults = allResults.concat(pageData.results);
            }
          });
          return allResults;
        });
      })
      .then(allResults => {
        console.log("Total results loaded:", allResults.length);
  
        // Populate table rows for each school.
        // Fields:
        // - Name: school.name
        // - School Type: from school.ownership (1 → Public, 2 → Private Nonprofit, 3 → Private For-Profit)
        // - Enrollment: latest.student.size
        // - Bachelor's Offered: if school.degrees_awarded.predominant equals 3 then Yes
        // - Retention Rate: latest.retention_rate.four_year.full_time
        // - Graduation Rate: latest.completion_rate_4yr_150nt
        allResults.forEach(school => {
          const tr = document.createElement('tr');
          tr.classList.add("hover:bg-gray-50", "dark:hover:bg-gray-800", "cursor-pointer");
  
          const schoolName = school['school.name'] || 'N/A';
          const ownership = school['school.ownership'];
          const enrollment = school['latest.student.size'] || 'N/A';
          const graduationRate = school['latest.completion_rate_4yr_150nt'];
          const retentionRate = school['latest.retention_rate.four_year.full_time'];
          const predominant = school['school.degrees_awarded.predominant'];
          const bachelorsOffered = (predominant == 3) ? 'Yes' : 'No';
  
          let schoolType = 'Unknown';
          if (ownership === 1) {
            schoolType = 'Public';
          } else if (ownership === 2) {
            schoolType = 'Private Nonprofit';
          } else if (ownership === 3) {
            schoolType = 'Private For-Profit';
          }
  
          const formattedRetention = (typeof retentionRate === 'number') ? (retentionRate * 100).toFixed(1) + '%' : 'N/A';
          const formattedGraduation = (typeof graduationRate === 'number') ? (graduationRate * 100).toFixed(1) + '%' : 'N/A';
  
          tr.innerHTML = `
            <td class="font-medium text-gray-900 whitespace-nowrap dark:text-white">${schoolName}</td>
            <td>${schoolType}</td>
            <td>${enrollment}</td>
            <td>${bachelorsOffered}</td>
            <td>${formattedRetention}</td>
            <td>${formattedGraduation}</td>
          `;
          tableBody.appendChild(tr);
        });
  
        // Initialize the datatable (adds search, pagination, export controls)
        initDataTable();
      })
      .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="6" class="px-4 py-2 text-red-600">Fetch error: ${error}</td></tr>`;
        console.error(error);
      });
  });
  