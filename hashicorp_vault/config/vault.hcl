storage "file" {
     path = "/vault/data"
   }

   listener "tcp" {
     address     = "0.0.0.0:8300"
     tls_disable = true
   }

   api_addr = "http://0.0.0.0:8300"
   ui = true
