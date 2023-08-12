# syntax=docker/dockerfile:1.4
FROM elasticsearch:8.8.1

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-nori

# This is optional prometheus exporter
RUN ./bin/elasticsearch-plugin install -b https://github.com/mindw/elasticsearch-prometheus-exporter/releases/download/8.8.1.0/prometheus-exporter-8.8.1.0.zip

HEALTHCHECK CMD curl http://localhost:9200/_cluster/health
