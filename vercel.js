{
  "version": 2,
  "env": {
    "BACKEND_URL": "http://wally.hidencloud.com:24620/"
  },
  "client": {
    "apiBase": "/api",
    "client_id": "1543274582520111104",
    "client_secret": "",
    "redirect_uri": "https://1c0b5e3e-3284-4c46-872d-884ad0f9274a-00-1w23bme6qpfbg.archer.replit.dev:3000/dashboard.html"
  },
  "rewrites": [
    {
      "source": "/image/:slug",
      "destination": "/api/media?path=/image/:slug"
    },
    {
      "source": "/media/:slug",
      "destination": "/api/media?path=/media/:slug"
    },
    {
      "source": "/raw/:slug",
      "destination": "/api/media?path=/raw/:slug"
    },
    {
      "source": "/v/:slug",
      "destination": "/api/media?path=/v/:slug"
    },
    {
      "source": "/video/:slug",
      "destination": "/api/media?path=/video/:slug"
    },
    {
      "source": "/",
      "destination": "/dashboard.html"
    }
  ],
  "headers": [
    {
      "source": "/dashboard.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
