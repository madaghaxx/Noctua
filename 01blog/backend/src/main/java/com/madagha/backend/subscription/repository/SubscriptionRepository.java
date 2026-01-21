package com.madagha.backend.subscription.repository;

import com.madagha.backend.subscription.entity.Subscription;
import com.madagha.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);

    boolean existsBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);

    Page<Subscription> findBySubscriber(User subscriber, Pageable pageable);

    Page<Subscription> findBySubscribedTo(User subscribedTo, Pageable pageable);

    long countBySubscribedTo(User subscribedTo);

    long countBySubscriber(User subscriber);

    void deleteBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);
}
