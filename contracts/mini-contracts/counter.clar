;; Counter Contract - Simple demonstration contract
;; Deployable mini contract for builder activity

(define-data-var counter uint u0)
(define-map user-counts principal uint)

;; Read the current counter value
(define-read-only (get-counter)
  (var-get counter)
)

;; Read a user's count
(define-read-only (get-user-count (user principal))
  (default-to u0 (map-get? user-counts user))
)

;; Increment the counter
(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (map-set user-counts tx-sender 
      (+ (get-user-count tx-sender) u1))
    (ok (var-get counter))
  )
)

;; Decrement the counter (if > 0)
(define-public (decrement)
  (let ((current (var-get counter)))
    (asserts! (> current u0) (err u1))
    (var-set counter (- current u1))
    (ok (var-get counter))
  )
)

;; Reset counter (only tx-sender's count)
(define-public (reset-my-count)
  (begin
    (map-set user-counts tx-sender u0)
    (ok true)
  )
)
