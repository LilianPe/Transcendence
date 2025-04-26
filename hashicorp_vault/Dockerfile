FROM hashicorp/vault:1.15

WORKDIR /vault

# Copier les fichiers de configuration (optionnel, à créer selon vos besoins)
# Exemple : fichier de configuration pour Vault
COPY config/vault.hcl /vault/config/vault.hcl

EXPOSE 8200

USER vault

CMD ["vault", "server", "-config=/vault/config/vault.hcl"]