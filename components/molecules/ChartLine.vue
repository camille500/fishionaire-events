<script setup>
import { Line } from 'vue-chartjs'

const props = defineProps({
  labels: {
    type: Array,
    required: true,
  },
  datasets: {
    type: Array,
    required: true,
  },
  height: {
    type: Number,
    default: 300,
  },
  yFormat: {
    type: Function,
    default: null,
  },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.color,
    backgroundColor: ds.color + '1a',
    fill: true,
    tension: 0.3,
    pointRadius: 2,
    pointHoverRadius: 5,
    borderWidth: 2,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: props.datasets.length > 1,
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(26, 26, 46, 0.9)',
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      padding: 10,
      cornerRadius: 8,
      callbacks: props.yFormat ? {
        label: (context) => {
          const label = context.dataset.label || ''
          const value = props.yFormat(context.parsed.y)
          return `${label}: ${value}`
        },
      } : {},
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 11 },
        maxTicksLimit: 8,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: { size: 11 },
        ...(props.yFormat ? { callback: (value) => props.yFormat(value) } : {}),
      },
    },
  },
}))
</script>

<template>
  <div class="chart-line" :style="{ height: height + 'px' }">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-line {
  position: relative;
  width: 100%;
}
</style>
