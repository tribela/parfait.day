# syntax=docker/dockerfile:1.4
ARG es_version=8.8.1
FROM elasticsearch:${es_version}
ARG es_version

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-nori

# This is optional prometheus exporter
RUN ./bin/elasticsearch-plugin install -b https://github.com/mindw/elasticsearch-prometheus-exporter/releases/download/${es_version}.0/prometheus-exporter-${es_version}.0.zip

HEALTHCHECK CMD curl http://localhost:9200/_cluster/health
