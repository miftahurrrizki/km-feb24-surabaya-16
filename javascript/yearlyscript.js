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
//------------------------------ SCORE CARD & FILTER FUNCTION ----------------------------------

        //FILTER
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
                    function processSalesDataPerCategory(data) {
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

                    let BarChart = null;

                    function createBarChartSalesCategory(data) {
                    let ctxBSC = document.getElementById("BarChartSalesPerCategory").getContext("2d");
                    if (BarChart != null) {
                            BarChart.data.labels = Object.keys(data); // Perbarui labels
                            BarChart.data.datasets.forEach((dataset) => {
                            dataset.data = Object.values(data); // Perbarui data
                        });
                        return BarChart.update();
                    }
                    BarChart = new Chart(ctxBSC, {
                        type: "bar",
                        data: {
                            labels: Object.keys(data), // Label adalah kategori
                            datasets: [
                                {
                                    label: "Total Sales by Category",
                                    data: Object.values(data), // Data adalah total penjualan
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
                                },
                            },
                        },
                    });
                }
            
                    // Ambil data penjualan dari server, proses, dan buat chart
                    function filterBarChart (){
                    fetchData(DataUrl)
                        .then(data => {
                            const filteredData = applyFilters(data);
                            const processedDataBarChart = processSalesDataPerCategory(filteredData);
                            createBarChartSalesCategory(processedDataBarChart);
                        });
                    }

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

            let lineChart = null;

        function createLineChartSalesProfit(processedData) {
            const labelsMonthYear = processedData.map(data => data.monthYear);
            const sales = processedData.map(data => data.sales);
            const profits = processedData.map(data => data.profit);

            const ctxLSP = document.getElementById('LineChartSalesProfit').getContext('2d');
            if (lineChart != null) {
                lineChart.data.labels = labelsMonthYear; // Perbarui labels
                lineChart.data.datasets[0].data = sales; // Perbarui data sales
                lineChart.data.datasets[1].data = profits; // Perbarui data profits
                return lineChart.update();
            }

            lineChart = new Chart(ctxLSP, {
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
        }

        // Function to fetch and process data
        function filterLineChart() {
            fetch(DataUrl)
                .then(response => response.json())
                .then(data => {
                    const filteredData = applyFilters(data); // Apply any filters if needed
                    const processedDataLineChart = preprocessData(filteredData); // Preprocess data as required
                    createLineChartSalesProfit(processedDataLineChart); // Create or update the chart
                })
                .catch(error => console.error('Error fetching data:', error));
        }
        
 //----------------------------------- TABLE PERFORMANCED SALES MAN -----------------------------------------
   let currentPage = 1;
        const itemsPerPage = 5;
        let totalSalesTable = {}; // Define totalSalesTable globally
        let sortedSalesmen = [];
        let sortDirection = 'asc'; // Initialize sort direction

        function calculateTotalSalesTable(orders) {
            const totalSales = {};

            orders.forEach(order => {
                const salesman = order["Customer Name"];
                const sales = parseFloat(order.Sales.replace(/\$/g, '').replace(/,/g, ''));

                // Check unique salesman dan jumlahkan total ordernya
                if (totalSales[salesman]) {
                    totalSales[salesman] += sales;
                } else {
                    // Jika salesman belum ada, tambahkan salesman baru
                    totalSales[salesman] = sales;
                }
            });

            return totalSales;
        }

        // Function untuk menampilkan data pada tabel
        function displaySalesmanTable(totalSalesTable) {
            const tableBody = document.getElementById('salesman-body');

            tableBody.innerHTML = '';

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            const salesmen = sortedSalesmen.slice(startIndex, endIndex);
            salesmen.forEach(salesman => {
                const row = `<tr>
                                <td>${salesman}</td>
                                <td>${totalSalesTable[salesman].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>`;
                tableBody.innerHTML += row;
            });

            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = endIndex >= sortedSalesmen.length;

            document.getElementById('pageInfo').textContent = `Page ${currentPage}`;
        }

        function sortSalesmen(totalSalesTable, direction) {
            const salesmen = Object.keys(totalSalesTable);

            salesmen.sort((a, b) => {
                if (direction === 'asc') {
                    return totalSalesTable[a] - totalSalesTable[b];
                } else {
                    return totalSalesTable[b] - totalSalesTable[a];
                }
            });

            return salesmen;
        }

        // Event listener untuk tombol "Previous"
        document.getElementById('prevBtn').addEventListener('click', () => {
            currentPage--;
            displaySalesmanTable(totalSalesTable);
        });

        // Event listener untuk tombol "Next"
        document.getElementById('nextBtn').addEventListener('click', () => {
            currentPage++;
            displaySalesmanTable(totalSalesTable);
        });

        // Event listener untuk tombol "Sort Asc"
        document.getElementById('sortAscBtn').addEventListener('click', () => {
            sortDirection = 'asc';
            sortedSalesmen = sortSalesmen(totalSalesTable, sortDirection);
            currentPage = 1;
            displaySalesmanTable(totalSalesTable);
        });

        // Event listener untuk tombol "Sort Desc"
        document.getElementById('sortDescBtn').addEventListener('click', () => {
            sortDirection = 'desc';
            sortedSalesmen = sortSalesmen(totalSalesTable, sortDirection);
            currentPage = 1;
            displaySalesmanTable(totalSalesTable);
        });

        function filterTable() {
            fetchData(DataUrl).then(data => {
                const filteredData = applyFilters(data);
                // Use the global totalSalesTable variable
                totalSalesTable = calculateTotalSalesTable(filteredData);
                sortedSalesmen = sortSalesmen(totalSalesTable, sortDirection);
                displaySalesmanTable(totalSalesTable);
            });
        }
    
 //----------------------------------- TREE MAP CHART REGION SALES -----------------------------------------
  function processDataRegionSales(data) {
    const aggregatedData = {};

    data.forEach(row => {
        const region = row.Region;
        const sales = parseFloat(row.Sales.replace(/\$/g, '').replace(/,/g, ''));

        if (aggregatedData[region]) {
            aggregatedData[region] += sales;
        } else {
            aggregatedData[region] = sales;
        }
    });

    return aggregatedData;
}

// Create the tree map chart
function createTreeMapChart(processedDataTreeMap) {
    const datasetTree = Object.keys(processedDataTreeMap).map(region => ({
        x: region,
        y: processedDataTreeMap[region]
    }));

    const options = {
        series: [{
            data: datasetTree
        }],
        chart: {
            type: 'treemap',
            height: 350
        },tooltip: {
            formatter: function(val) {
                return "Total Sales: $" + (val.toLocaleString('en-US', { maximumFractionDigits: 2 })) + "M";
            }
        },
        colors: ['#ff8f00'],
        legend: {
            show: true
        }
    };

    const chart = new ApexCharts(document.querySelector("#TreeMapChartSalesRegion"), options);
    chart.render();
}

function filterTreeMapChart() {
    fetchData(DataUrl)
        .then(data => {
            const filteredData = applyFilters(data);
            const processedDataTreeMap = processDataRegionSales(filteredData);
            createTreeMapChart(processedDataTreeMap);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

 //----------------------------------- VERTICAL BAR CHART PRODUCT SALES -----------------------------------------
    const ctxVBPS = document.getElementById('VerticalBarchartProductSales').getContext('2d');
    // Hitung Sales per Category
    function processSalesProductData(data) {
        const aggregatedData = {};

        data.forEach(row => {
            const product = row["Product Name"];
            const quantity = row.Quantity;

            // check unique category terus jumlahkan salesnya
            if (aggregatedData[product]) {
                aggregatedData[product] += quantity;
            } else {
                // Jika kategori belum ada, tambahkan kategori baru
                aggregatedData[product] = quantity;
            }
        });
         // Urutkan produk berdasarkan penjualan dari tertinggi ke terendah
        const sortedProducts = Object.keys(aggregatedData).sort((a, b) => aggregatedData[b] - aggregatedData[a]);

        // Ambil hanya 10 produk teratas
        const top10Products = sortedProducts.slice(0, 5);

        // Buat objek baru untuk menyimpan hanya 10 produk teratas
        const top10Data = {};
        top10Products.forEach(product => {
            top10Data[product] = aggregatedData[product];
        });

        return top10Data;
    }

    let VerticalBarChart = null;

    function createVerticalBarChartProductSales(data) {
    let ctxVBPS = document.getElementById("VerticalBarchartProductSales").getContext("2d");
    if (VerticalBarChart != null) {
            VerticalBarChart.data.labels = Object.keys(data);
            VerticalBarChart.data.datasets.forEach((dataset) => {
            dataset.data = Object.values(data); 
        });
        return VerticalBarChart.update();
    }
    VerticalBarChart = new Chart(ctxVBPS, {
        type: "bar",
        data: {
            labels: Object.keys(data), 
            datasets: [
                {
                    label: "Total Quantity Sales Product",
                    data: Object.values(data), 
                    borderWidth: 1,
                },
            ],
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

    // Ambil data penjualan dari server, proses, dan buat chart
    function filterVerticalBarChart (){
    fetchData(DataUrl)
        .then(data => {
            const filteredData = applyFilters(data);
            const processedDataVerticalBarChart = processSalesProductData(filteredData);
            createVerticalBarChartProductSales(processedDataVerticalBarChart);
        });
    }
    
    //----------------------------------- STACKED BAR CHART STATE SALES -----------------------------------------
    const colorPalette = ['#1B1A17', '#F0A500', '#E45826', '#E6D5B8'];


    function processStackedBarChartSalesDataPerCategory(data) {
            const SalesDataPerCategory = {};

            data.forEach(item => {
                const state = item["State"];
                const category = item["Category"];
                const sales = parseFloat(item["Sales"].replace('$', '').replace(',', '.'));

                if (!SalesDataPerCategory[state]) {
                    SalesDataPerCategory[state] = {};
                }
                if (SalesDataPerCategory[state][category]) {
                    SalesDataPerCategory[state][category] += sales;
                } else {
                    SalesDataPerCategory[state][category] = sales;
                }
            });

            return SalesDataPerCategory;
        }

        function prepareStackedChartData(SalesDataPerCategory) {
            const states = Object.keys(SalesDataPerCategory);
            const categories = new Set();

            states.forEach(state => {
                Object.keys(SalesDataPerCategory[state]).forEach(category => {
                    categories.add(category);
                });
            });

            const totalSalesByState = states.map(state => {
                return {
                    state: state,
                    totalSales: Object.values(SalesDataPerCategory[state]).reduce((a, b) => a + b, 0)
                };
            });

            totalSalesByState.sort((a, b) => b.totalSales - a.totalSales);

            // Select top 10 states by total sales
            const topStates = totalSalesByState.slice(0, 10).map(item => item.state);

            const datasets = Array.from(categories).map((category, index) => {
                return {
                    label: category,
                    data: topStates.map(state => SalesDataPerCategory[state][category] || 0),
                    backgroundColor: colorPalette[index % colorPalette.length]
                };
            });

            return {
                labels: topStates,
                datasets: datasets
            };
        }

        let StackedBarChart = null;

        function createStackedBarChart(chartData) {
            const ctxSBC = document.getElementById('StackedBarChartSalesPerState').getContext('2d');
            if (StackedBarChart != null) {
                StackedBarChart.data = chartData;
                return StackedBarChart.update();
            }

            StackedBarChart = new Chart(ctxSBC, {
                type: 'bar',
                data: chartData,
                options: {
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Fetch, process, and render the data
        function filterStackedBarChart() {
            fetchData(DataUrl).then(data => {
                if (data) {
                    const filteredData = applyFilters(data);
                    const SalesDataPerCategory = processStackedBarChartSalesDataPerCategory(filteredData);
                    const chartData = prepareStackedChartData(SalesDataPerCategory);
                    createStackedBarChart(chartData);
                }
            });
        }

        //------------------------------------------------ EVENT LISTENER ------------------------------------------------
        // UPDATE CARD
        document.getElementById('stateSelect').addEventListener('change', postDataCard);
        document.getElementById('categorySelect').addEventListener('change', postDataCard);
        document.getElementById('segmentSelect').addEventListener('change', postDataCard);

        // UPDATE BARCHART (CHART ROW 1 COLS 1)
        document.getElementById('stateSelect').addEventListener('change', filterBarChart);
        document.getElementById('categorySelect').addEventListener('change', filterBarChart);
        document.getElementById('segmentSelect').addEventListener('change', filterBarChart);
         
        // UPDATE BARCHART (CHART ROW 1 COLS 2)
        document.getElementById('stateSelect').addEventListener('change', filterStackedBarChart);
        document.getElementById('categorySelect').addEventListener('change', filterStackedBarChart);
        document.getElementById('segmentSelect').addEventListener('change', filterStackedBarChart);
        
        // UPDATE LINECHART (CHART ROW 2)
        document.getElementById('stateSelect').addEventListener('change', filterLineChart);
        document.getElementById('categorySelect').addEventListener('change', filterLineChart);
        document.getElementById('segmentSelect').addEventListener('change', filterLineChart);

        // UPDATE TABLE (CHART ROW 3 COLS 1)
        document.getElementById('stateSelect').addEventListener('change', filterTable);
        document.getElementById('categorySelect').addEventListener('change', filterTable);
        document.getElementById('segmentSelect').addEventListener('change', filterTable);

        // UPDATE TREE MAP (CHART ROW 3 COLS 2)
        document.getElementById('stateSelect').addEventListener('change', filterTreeMapChart);
        document.getElementById('categorySelect').addEventListener('change', filterTreeMapChart);
        document.getElementById('segmentSelect').addEventListener('change', filterTreeMapChart);

        // UPDATE VERTICAL CHART (CHART ROW 3 COLS 3)
        document.getElementById('stateSelect').addEventListener('change', filterVerticalBarChart);
        document.getElementById('categorySelect').addEventListener('change', filterVerticalBarChart);
        document.getElementById('segmentSelect').addEventListener('change', filterVerticalBarChart);

        
        // Fetch data, populate dropdowns, dan lakukan kalkulasi awal
        fetchData(DataUrl).then(data => {
            populateDropdowns(data);
            filterBarChart();
            filterLineChart();
            filterVerticalBarChart();
            filterTreeMapChart();
            filterTable();
            filterStackedBarChart();
            postDataCard();
        });