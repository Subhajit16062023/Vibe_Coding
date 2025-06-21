import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TelecomDataService } from '../services/telecom-data.service';
import { AuthService } from '../services/auth.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface NetworkStatus {
  region: string;
  status: string;
  uptime: number;
  latency: number;
}

interface CustomerMetric {
  month: string;
  newCustomers: number;
  churnRate: number;
  satisfaction: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  // KPI Data
  totalCustomers = 0;
  monthlyRevenue = 0;
  networkUptime = 0;
  activeServices = 0;
  
  // Charts
  networkChart: any;
  customerChart: any;
  revenueChart: any;
  
  // Tables
  networkStatus: NetworkStatus[] = [];
  recentAlerts: any[] = [];
  
  // Display columns for tables
  networkColumns: string[] = ['region', 'status', 'uptime', 'latency'];
  alertColumns: string[] = ['time', 'type', 'message', 'severity'];

  constructor(
    private telecomService: TelecomDataService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  getCurrentUser(): string {
    return this.authService.getCurrentUser() || 'Admin';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  loadDashboardData(): void {
    this.telecomService.getDashboardMetrics().subscribe(data => {
      this.totalCustomers = data.totalCustomers;
      this.monthlyRevenue = data.monthlyRevenue;
      this.networkUptime = data.networkUptime;
      this.activeServices = data.activeServices;
    });

    this.telecomService.getNetworkStatus().subscribe(data => {
      this.networkStatus = data;
    });

    this.telecomService.getRecentAlerts().subscribe(data => {
      this.recentAlerts = data;
    });
  }

  initializeCharts(): void {
    this.createNetworkChart();
    this.createCustomerChart();
    this.createRevenueChart();
  }

  createNetworkChart(): void {
    const ctx = document.getElementById('networkChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.networkChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [{
          label: 'Network Traffic (Gbps)',
          data: [120, 135, 180, 165, 190, 175],
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Network Traffic (24h)'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createCustomerChart(): void {
    const ctx = document.getElementById('customerChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.customerChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'New Customers',
          data: [2500, 3200, 2800, 3500, 4100, 3800],
          backgroundColor: '#4caf50',
          borderColor: '#388e3c',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Customer Acquisition'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.revenueChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Mobile', 'Internet', 'TV', 'Business'],
        datasets: [{
          data: [45, 30, 15, 10],
          backgroundColor: [
            '#ff9800',
            '#2196f3',
            '#9c27b0',
            '#f44336'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Revenue by Service (%)'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'success';
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  }
}
