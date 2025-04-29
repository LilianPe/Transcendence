storage "file" {
    path = "/vault/data"
  }

  listener "tcp" {
    address     = "0.0.0.0:8300"
    tls_cert_file = "/tmp/ssl/transcendence.crt"
    tls_key_file  = "/tmp/ssl/transcendence.key"
  }

  api_addr = "https://0.0.0.0:8300"
  ui = true
