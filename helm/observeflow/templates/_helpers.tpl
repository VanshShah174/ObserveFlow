{{/*
Common labels applied to all resources
*/}}
{{- define "observeflow.labels" -}}
app.kubernetes.io/managed-by: Helm
app.kubernetes.io/part-of: observeflow
{{- end }}

{{/*
Selector labels for a specific service
*/}}
{{- define "observeflow.selectorLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .instance }}
{{- end }}

{{/*
Resolve image tag — use service-specific tag or fall back to global
*/}}
{{- define "observeflow.imageTag" -}}
{{- if .serviceTag }}{{ .serviceTag }}{{- else }}{{ .globalTag }}{{- end }}
{{- end }}
