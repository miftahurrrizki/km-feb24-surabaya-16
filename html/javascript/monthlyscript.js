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

//------------------------------------------------- KALAU MAU TAMBAH CHART DISINI!!!!! ------------------------------------------------
    
// ------------------------------------- BARCHART STATE HIGHEST SALES -------------------------------------
// Fungsi untuk memproses data penjualan dan mendapatkan negara bagian dengan penjualan tertinggi
function processSalesData(data) {
    const aggregatedData = {};

    data.forEach(row => {
        const state = row.State;
        const sales = parseFloat(row.Sales.replace(/\$/g, '').replace(/,/g, ''));

        if (aggregatedData[state]) {
            aggregatedData[state] += sales;
        } else {
            aggregatedData[state] = sales;
        }
    });

    // Mengubah objek aggregatedData menjadi array untuk diurutkan
    const sortedDataArray = Object.entries(aggregatedData).sort((a, b) => b[1] - a[1]);

    // Mengembalikan objek yang diurutkan
    const sortedData = {};
    sortedDataArray.forEach(([state, sales]) => {
        sortedData[state] = sales;
    });

    return sortedData;
}

// Variabel global untuk chart
let BarChartSales = null;

// Fungsi untuk membuat bar chart
function createBarChartSalesState(data) {
    const ctx = document.getElementById("BarChartSalesPerState").getContext("2d");
    if (BarChartSales != null) {
        BarChartSales.destroy(); // Hapus chart sebelumnya jika ada
    }

    BarChartSales = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(data), // Label adalah nama negara bagian
            datasets: [
                {
                    label: "Total Sales by State",
                    data: Object.values(data), // Data adalah total penjualan
                    backgroundColor: 'rgba(255, 143, 0, 1)',
                    borderColor: 'rgba(255, 143, 0, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString(); // Format angka menjadi dolar
                        }
                    }
                },
            },
        },
    });
}

// Ambil data sales dari server, proses, dan buat chart
fetchData(DataUrl)
    .then(data => {
        const processedData = processSalesData(data);
        createBarChartSalesState(processedData);
    });

// ------------------------------------- BARCHART STATE HIGHEST PROFIT -------------------------------------
// Fungsi untuk memproses data profit dan mendapatkan profit per negara bagian
function processProfitData(data) {
    const aggregatedData = {};

    data.forEach(row => {
        const state = row.State;
        const profit = parseFloat(row.Profit.replace(/\$/g, '').replace(/,/g, ''));

        if (aggregatedData[state]) {
            aggregatedData[state] += profit;
        } else {
            aggregatedData[state] = profit;
        }
    });

    // Mengubah objek aggregatedData menjadi array untuk diurutkan
    const sortedDataArray = Object.entries(aggregatedData).sort((a, b) => b[1] - a[1]);

    // Mengembalikan objek yang diurutkan
    const sortedData = {};
    sortedDataArray.forEach(([state, profit]) => {
        sortedData[state] = profit;
    });

    return sortedData;
}

// Variabel global untuk chart
let BarChartProfit = null;

// Fungsi untuk membuat bar chart
function createBarChartProfitState(data) {
    const ctx = document.getElementById("BarChartProfitPerState").getContext("2d");
    if (BarChartProfit != null) {
        BarChartProfit.destroy(); // Hapus chart sebelumnya jika ada
    }

    BarChartProfit = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(data), // Label adalah nama negara bagian
            datasets: [
                {
                    label: "Total Profit by State",
                    data: Object.values(data), // Data adalah total profit
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString(); // Format angka menjadi dolar
                        }
                    }
                },
            },
        },
    });
}


// Ambil data profit dari server, proses, dan buat chart
fetchData(DataUrl)
    .then(data => {
        const processedData = processProfitData(data);
        createBarChartProfitState(processedData);
    })

//-------------------------------- LINE CHART MONTHLY SALES PERFORMANCE ----------------------------------
// Fungsi untuk memproses data penjualan bulanan
const preprocessData = (data) => {
    const result = {};

    data.forEach(order => {
        const date = new Date(order["Order Date"]);
        const month = date.toLocaleString('default', { month: 'long' });

        if (!result[month]) {
            result[month] = { sales: 0 };
        }

        result[month].sales += parseFloat(order.Sales.replace(/[^0-9.-]+/g, ""));
    });

    const sortedData = [];

    Object.keys(result).sort((a, b) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months.indexOf(a) - months.indexOf(b);
    }).forEach(month => {
        sortedData.push({
            month: month,
            sales: result[month].sales
        });
    });

    return sortedData;
};

// Konfigurasi line chart untuk penjualan bulanan
const createLineChart = (processedData) => {
    const labelsMonth = processedData.map(data => data.month);
    const sales = processedData.map(data => data.sales);

    const ctxLSP = document.getElementById('LineChartMonthlySales').getContext('2d');
    new Chart(ctxLSP, {
        type: 'line',
        data: {
            labels: labelsMonth,
            datasets: [
                {
                    label: 'Sales',
                    data: sales,
                    backgroundColor: 'rgba(255, 143, 0, 1)',
                    borderColor: 'rgba(255, 143, 0, 1)',
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

// Fetching data dari JSON
fetch(DataUrl)
    .then(response => response.json())
    .then(data => {
        const processedDataLineChart = preprocessData(data);
        createLineChart(processedDataLineChart);
    })
    .catch(error => console.error('Error fetching data:', error));








//------------------------------------^^^^^^^ KALAU MAU TAMBAH CHART DISINI (INI BATASNYA)!!!!! ^^^^^-----------------------------------------
//------------------------------------------------ EVENT LISTENER ------------------------------------------------
// Tambah event listeners ke dropdowns
document.getElementById('stateSelect').addEventListener('change', postDataCard);
document.getElementById('categorySelect').addEventListener('change', postDataCard);
document.getElementById('segmentSelect').addEventListener('change', postDataCard);

// Fetch data, populate dropdowns, dan lakukan kalkulasi awal
fetchData(DataUrl).then(data => {
   populateDropdowns(data);
   postDataCard();
}); 