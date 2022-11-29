FROM elasticsearch:7.16.2

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-nori

HEALTHCHECK CMD curl http://localhost:9200/_cluster/health
