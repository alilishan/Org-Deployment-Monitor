export type ServiceInstance = {
  host: string
  port: number
  proxyUrl: string
  url: string
  lastHeartbeat: number
}

export type GatewayService = {
  serviceName: string
  instances: ServiceInstance[]
}

export type RabbitMessages = {
  ready: number
  unacknowledged: number
  total: number
}

export type RabbitManagement = {
  status: string
  version: string
  connections: number
  channels: number
  queues: number
  consumers: number
  messages: RabbitMessages
  cluster_name: string
}

export type RabbitStatus = {
  connection: string
  connection_details: {
    connected: boolean
    status: string
    reconnectAttempts: number
  }
  management?: RabbitManagement
}

export type GatewayMemory = {
  rss: number
  heapTotal: number
  heapUsed: number
}

export type GatewayStatus = {
  name: string
  version: string
  environment: string
  timestamp: string
  uptime: number
  memory: GatewayMemory
  services: GatewayService[]
  rabbitmq: RabbitStatus
}
