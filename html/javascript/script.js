   //------------------------------ GENERAL FUNCTION ----------------------------------
   const DataUrl = 'http://localhost:3000/data';
            
   // Ambil data dari json
   function fetchData(url) {
       return fetch(url)
           .then(response => {
               if (!response.ok) {
                   throw new Error('Network response was not ok');
               }
               return response.json();
           })
           .catch(error => {
               console.error('There was a problem with the fetch operation:', error);
           });
   }


//------------------------------ SCORE CARD FUNCTION ----------------------------------
function isiDropdownFilter(selectElement, items) {
   if (Array.isArray(items)) {
       items.forEach(function(item) {
           const option = document.createElement('option');
           option.value = item;
           option.textContent = item;
           selectElement.appendChild(option);
       });
   } else {
       console.error('Expected an array but got:', items);
   }
}

// Populasi dropdowns dengan nilai unik dari data
function populateDropdowns(data) {
   const states = [...new Set(data.map(row => row.State))];
   const categories = [...new Set(data.map(row => row.Category))];
   const segments = [...new Set(data.map(row => row.Segment))];

   isiDropdownFilter(document.getElementById('stateSelect'), states);
   isiDropdownFilter(document.getElementById('categorySelect'), categories);
   isiDropdownFilter(document.getElementById('segmentSelect'), segments);
}

// Ambil value Filter
function applyFilters(data) {
   const selectedState = document.getElementById('stateSelect').value;
   const selectedCategory = document.getElementById('categorySelect').value;
   const selectedSegment = document.getElementById('segmentSelect').value;

   return data.filter(row => {
       return (!selectedState || row.State === selectedState) &&
           (!selectedCategory || row.Category === selectedCategory) &&
           (!selectedSegment || row.Segment === selectedSegment);
   });
}

// Hitung Total Sales
function calculateTotalSales(data) {
   let totalSales = 0;
   data.forEach(row => {
       const sales = parseFloat(row.Sales.replace(/\$/g, '').replace(/,/g, ''));
       totalSales += sales;
   });
   return totalSales;
}

// Hitung Total Profit
function calculateTotalProfit(data) {
   let totalProfit = 0;
   data.forEach(row => {
       const profit = parseFloat(row.Profit.replace(/\$/g, '').replace(/,/g, ''));
       totalProfit += profit;
   });
   return totalProfit;
}

// Hitung Total Orders
function calculateTotalOrders(data) {
   return data.length;
}

// Post To Card
function postDataCard() {
   fetchData(DataUrl).then(data => {
       const filteredData = applyFilters(data);

       const totalOrder = calculateTotalOrders(filteredData);
       const formattedTotalOrder = totalOrder.toLocaleString('en-US');
       document.getElementById('cardOrder').innerText = `${formattedTotalOrder}`;

       // Total Sales
       const totalSales = calculateTotalSales(filteredData);
       const formattedTotalSales = totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
       document.getElementById('cardSales').innerText = `$ ${formattedTotalSales}`;

       // Total Profit
       const totalProfit = calculateTotalProfit(filteredData);
       const formattedTotalProfit = totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
       document.getElementById('cardProfit').innerText = `$ ${formattedTotalProfit}`;

       // Profit Ratio
       const profitRatio = (totalProfit / totalSales) * 100;
       const formattedTotalProfitRatio = Math.round(profitRatio).toLocaleString('en-US');
       document.getElementById('cardProfitRatio').innerText = `${formattedTotalProfitRatio} %`;
   });
}


   //------------------------------ BARCHART SALES PER CATEGORY --------------------------------
   
           const ctxBSC = document.getElementById('BarChartSalesPerCategory').getContext('2d');
           
           // Hitung Sales per Category
           function processSalesData(data) {
               const aggregatedData = {};
   
               data.forEach(row => {
                   const category = row.Category;
                   const sales = parseFloat(row.Sales.replace(/\$/g, '').replace(/,/g, ''));
   
                   // check unique category terus jumlahkan salesnya
                   if (aggregatedData[category]) {
                       aggregatedData[category] += sales;
                   } else {
                       // Jika kategori belum ada, tambahkan kategori baru
                       aggregatedData[category] = sales;
                   }
               });
   
               return aggregatedData;
           }

           // Fungsi untuk membuat chart berdasarkan data yang telah diproses
           function createBarChartSalesCategory(data) {
               new Chart(ctxBSC, {
                   type: 'bar',
                   data: {
                       labels: Object.keys(data), // Label adalah kategori
                       datasets: [{
                           label: 'Total Sales by Category',
                           data: Object.values(data), // Data adalah total penjualan
                           borderWidth: 1
                       }]
                   },
                   options: {
                       responsive: true, 
                       maintainAspectRatio: false,
                       scales: {
                           y: {
                               beginAtZero: true
                           }
                       }
                   }
               });
           }
   
           // Ambil data penjualan dari server, proses, dan buat chart
           function filterBarChart (){
           fetchData(DataUrl)
               .then(data => {
                   const filteredData = applyFilters(data);
                   const processedDataBarChart = processSalesData(filteredData);
                   createBarChartSalesCategory(processedDataBarChart);
               });
           }

    //------------------------------ DUMMY BARCHART SALES PER CATEGORY --------------------------------               
       const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
       const data = {
           labels: labels,
           datasets: [{
               label: 'My First Dataset',
               data: [65, 59, 80, 81, 56, 55, 40],
               backgroundColor: 'rgba(75, 192, 192, 0.5)',
               borderColor: 'rgba(75, 192, 192, 1)',
               borderWidth: 1
           }]
       };

       // Konfigurasi chart
       const config = {
           type: 'bar',
           data: data,
           options: {
               responsive: true, // Aktifkan responsif
               maintainAspectRatio: false, // Buat chart tidak mempertahankan rasio aspek
               scales: {
                   y: {
                       beginAtZero: true
                   }
               }
           }
       };

       // Membuat chart
       var myChart = new Chart(
           document.getElementById('DummyChart'),
           config
       );

  //------------------------------ LINE CHART YoY PERFORMANCE --------------------------------
  const preprocessData = (data) => {
       const result = {};

       data.forEach(order => {
           const date = new Date(order["Order Date"]);
           const year = date.getFullYear();
           const month = date.toLocaleString('default', { month: 'long' });

           if (!result[year]) {
               result[year] = {};
           }

           if (!result[year][month]) {
               result[year][month] = { sales: 0, profit: 0 };
           }

           result[year][month].sales += parseFloat(order.Sales.replace(/[^0-9.-]+/g, ""));
           result[year][month].profit += parseFloat(order.Profit.replace(/[^0-9.-]+/g, ""));
       });

       const sortedData = [];

       Object.keys(result).sort().forEach(year => {
           Object.keys(result[year]).sort((a, b) => new Date(`1 ${a} ${year}`) - new Date(`1 ${b} ${year}`)).forEach(month => {
               sortedData.push({
                   monthYear: `${month} ${year}`,
                   sales: result[year][month].sales,
                   profit: result[year][month].profit
               });
           });
       });

       return sortedData;
   };

   // Konfigurasi line chart
   const createLineChart = (processedData) => {
       const labelsMonthYear = processedData.map(data => data.monthYear);
       const sales = processedData.map(data => data.sales);
       const profits = processedData.map(data => data.profit);

       const ctxLSP = document.getElementById('LineChartSalesProfit').getContext('2d');
       new Chart(ctxLSP, {
           type: 'line',
           data: {
               labels: labelsMonthYear,
               datasets: [
                   {
                       label: 'Sales',
                       data: sales,
                       borderColor: 'rgba(75, 192, 192, 1)',
                       borderWidth: 2,
                       fill: false,
                       tension: 0.2,
                   },
                   {
                       label: 'Profit',
                       data: profits,
                       borderColor: 'rgba(153, 102, 255, 1)',
                       borderWidth: 2,
                       fill: false,
                       tension: 0.2,
                   }
               ]
           },
           options: {
               responsive: true, 
               maintainAspectRatio: false, 
               scales: {
                   x: {
                       display: true,
                       title: {
                           display: true,
                           text: 'Month/Year'
                       }
                   },
                   y: {
                       display: true,
                       title: {
                           display: true,
                           text: 'Amount ($)'
                       }
                   }
               }
           }
       });
   };

   // Fetching data dari json
   fetch(DataUrl)
       .then(response => response.json())
       .then(data => {
           const processedDataLineChart = preprocessData(data);
           createLineChart(processedDataLineChart);
       })
       .catch(error => console.error('Error fetching data:', error));

    

//------------------------------------------------ EVENT LISTENER ------------------------------------------------
// Tambah event listeners ke dropdowns
document.getElementById('stateSelect').addEventListener('change', postDataCard);
document.getElementById('categorySelect').addEventListener('change', postDataCard);
document.getElementById('segmentSelect').addEventListener('change', postDataCard);

document.getElementById('stateSelect').addEventListener('change', filterBarChart);
document.getElementById('categorySelect').addEventListener('change', filterBarChart);
document.getElementById('segmentSelect').addEventListener('change', filterBarChart);

// Fetch data, populate dropdowns, dan lakukan kalkulasi awal
fetchData(DataUrl).then(data => {
   populateDropdowns(data);
   filterBarChart();
   postDataCard();
}); 