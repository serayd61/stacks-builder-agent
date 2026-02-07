;; Storage Contract - Key-value storage demonstration
;; Deployable mini contract for builder activity

(define-map storage 
  { owner: principal, key: (string-ascii 64) }
  { value: (string-utf8 256), updated-at: uint }
)

(define-map user-key-count principal uint)

;; Store a value
(define-public (store (key (string-ascii 64)) (value (string-utf8 256)))
  (begin
    (map-set storage 
      { owner: tx-sender, key: key }
      { value: value, updated-at: block-height }
    )
    (map-set user-key-count tx-sender 
      (+ (default-to u0 (map-get? user-key-count tx-sender)) u1))
    (ok true)
  )
)

;; Get a value
(define-read-only (get-value (owner principal) (key (string-ascii 64)))
  (map-get? storage { owner: owner, key: key })
)

;; Get user's key count
(define-read-only (get-key-count (user principal))
  (default-to u0 (map-get? user-key-count user))
)

;; Delete a value
(define-public (delete-value (key (string-ascii 64)))
  (begin
    (map-delete storage { owner: tx-sender, key: key })
    (ok true)
  )
)
